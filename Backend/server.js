import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'finsphere-secret-key-2025';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://prabhudesai08_db_user:AMRfsHDBNAOi8vPM@cluster0.1poj5pv.mongodb.net/finsphere?retryWrites=true&w=majority';

if (!MONGODB_URI) {
  console.warn('WARNING: MONGODB_URI is not defined in environment variables. Database features will fail.');
}

app.use(cors());
app.use(express.json());

// --- MONGODB CONNECTION ---
mongoose.set('strictQuery', false);
mongoose.set('bufferCommands', false);
mongoose.set('autoIndex', true);

const tenantInitCache = new Set();

async function connectDB() {
  if (!MONGODB_URI) {
    console.warn('WARNING: MONGODB_URI is not defined. Please set it in Settings > Environment Variables.');
    return;
  }

  try {
    const startDb = Date.now();
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10, // Connection pooling
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log(`Connected to MongoDB in ${Date.now() - startDb}ms`);
    await seedAdmin();
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
  }
};

// connectDB(); // Moved to start()

// --- MODELS ---
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['superadmin', 'company_owner', 'agent'], required: true },
  companyId: { type: String, default: null },
  name: String,
  mobile: String,
  active: { type: Boolean, default: true },
  assignedAccounts: [{ type: String }]
});

const companySchema = new mongoose.Schema({
  name: { type: String, required: true, index: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  active: { type: Boolean, default: true, index: true },
  startDate: String,
  expiryDate: String,
  amcAmount: String,
  amcStatus: { type: String, default: 'Pending' },
  logo: String
}, { timestamps: true });

const customerSchema = new mongoose.Schema({
  companyId: { type: String, required: true, index: true },
  custNo: { type: String, required: true, index: true },
  name: { type: String, required: true },
  mobile: String,
  address: String,
  email: String
});

const accountSchema = new mongoose.Schema({
  companyId: { type: String, required: true },
  accNo: String,
  name: { type: String, required: true },
  group: String,
  type: String,
  category: { type: String, default: 'ledger' },
  balance: { type: Number, default: 0 },
  status: { type: String, default: 'active' },
  customerId: String,
  openingDate: { type: Date, default: Date.now },
  voucherRef: String
});

const transactionSchema = new mongoose.Schema({
  companyId: { type: String, required: true },
  accId: { type: String, required: true },
  secAccId: { type: String, required: true },
  type: String,
  amt: Number,
  desc: String,
  date: { type: Date, default: Date.now },
  voucherNo: String
});

const groupSchema = new mongoose.Schema({
  companyId: { type: String, required: true },
  name: String,
  type: String
});

const accountTypeSchema = new mongoose.Schema({
  companyId: { type: String, required: true, index: true },
  name: String,
  prefix: String,
  group: String
});

userSchema.index({ username: 1 }, { unique: true, collation: { locale: 'en', strength: 2 } });
userSchema.index({ companyId: 1 });
userSchema.index({ role: 1 });
companySchema.index({ ownerId: 1 });
companySchema.index({ active: 1 });
customerSchema.index({ companyId: 1 });
customerSchema.index({ custNo: 1 });
accountSchema.index({ companyId: 1 });
accountSchema.index({ customerId: 1 });
accountSchema.index({ accNo: 1 });
transactionSchema.index({ companyId: 1 });
transactionSchema.index({ accId: 1 });
transactionSchema.index({ secAccId: 1 });
transactionSchema.index({ date: -1 });
transactionSchema.index({ type: 1 });
groupSchema.index({ companyId: 1 });
accountTypeSchema.index({ companyId: 1 });

const User = mongoose.model('User', userSchema);
const Company = mongoose.model('Company', companySchema);
const Customer = mongoose.model('Customer', customerSchema);
const Account = mongoose.model('Account', accountSchema);
const Transaction = mongoose.model('Transaction', transactionSchema);
const Group = mongoose.model('Group', groupSchema);
const AccountType = mongoose.model('AccountType', accountTypeSchema);

// --- SEED ADMIN ---
// Seed Super Admin with normalized username
async function seedAdmin() {
  try {
    // Normalization Migration: Update all existing users to have lowercase usernames
    const allUsers = await User.find({});
    for (const user of allUsers) {
      if (user.username && user.username !== user.username.toLowerCase()) {
        const normalized = user.username.toLowerCase();
        // Check if normalized version already exists to avoid collisions
        const collision = await User.findOne({ username: normalized, _id: { $ne: user._id } });
        if (!collision) {
          user.username = normalized;
          await user.save();
          console.log(`Migrated user: ${user.username}`);
        }
      }
    }
    const admin = await User.findOne({ role: 'superadmin' });
    if (!admin) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await User.create({
        username: 'admin',
        password: hashedPassword,
        role: 'superadmin'
      });
      console.log('Default superadmin created: admin / admin123');
    }

    // Force reset/creation for user 'mahesh' to address login failure
    let mahesh = await User.findOne({ username: 'mahesh' });
    if (!mahesh) {
      console.log('User "mahesh" not found, creating test account...');
      let company = await Company.findOne();
      if (!company) {
        company = await Company.create({ 
          name: 'Mahesh Enterprises', 
          startDate: new Date().toISOString().split('T')[0],
          expiryDate: new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0]
        });
        console.log('Created default company for mahesh');
      }
      
      mahesh = await User.create({
        username: 'mahesh',
        password: await bcrypt.hash('mahesh', 10),
        role: 'company_owner',
        companyId: company._id.toString(),
        name: 'Mahesh Kumar'
      });
      
      company.ownerId = mahesh._id;
      await company.save();
      await initTenantData(company._id.toString());
      console.log('Created user "mahesh" with password "mahesh"');
    } else {
      mahesh.password = await bcrypt.hash('mahesh', 10);
      await mahesh.save();
      await initTenantData(mahesh.companyId);
      console.log('Password for user "mahesh" has been reset to "mahesh"');
    }
  } catch (err) {
    console.error('Seed admin error:', err);
  }
};

const DEFAULT_GROUPS = [
  { name: "Cash", type: "Asset" },
  { name: "Bank", type: "Asset" },
  { name: "Loans", type: "Asset" },
  { name: "Deposits", type: "Liability" },
  { name: "Income", type: "Income" },
  { name: "Expense", type: "Expense" }
];

const DEFAULT_ACCOUNT_TYPES = [
  { name: "Savings", prefix: "SB", group: "Deposits" },
  { name: "Loan", prefix: "LN", group: "Loans" },
  { name: "Pigmy", prefix: "PG", group: "Deposits" },
  { name: "RD", prefix: "RD", group: "Deposits" },
  { name: "Personal Loan", prefix: "PL", group: "Loans" },
  { name: "Pigmy Loan", prefix: "PGL", group: "Loans" }
];

const initTenantData = async (companyId) => {
  // Ensure Groups exist
  for (const group of DEFAULT_GROUPS) {
    const exists = await Group.findOne({ companyId, name: group.name });
    if (!exists) {
      await Group.create({ ...group, companyId });
    }
  }

  // Ensure Account Types exist
  for (const type of DEFAULT_ACCOUNT_TYPES) {
    const exists = await AccountType.findOne({ companyId, name: type.name });
    if (!exists) {
      await AccountType.create({ ...type, companyId });
    }
  }

  const accountCount = await Account.countDocuments({ companyId });
  if (accountCount === 0) {
    await Account.create([
      { companyId, name: "Cash in Hand", group: "Cash", type: "cash", category: "ledger", balance: 0, accNo: 'CASH001' },
      { companyId, name: "Bank Account", group: "Bank", type: "bank", category: "ledger", balance: 0, accNo: 'BANK001' }
    ]);
  }
};

// --- MIDDLEWARE ---
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'Missing Authorization header' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Missing token' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

const requireSuperAdmin = (req, res, next) => {
  if (req.user.role !== 'superadmin') return res.status(403).json({ message: 'Access denied: Requires system admin privileges' });
  next();
};

const injectTenantContext = async (req, res, next) => {
  const companyId = req.user.companyId;
  if (!companyId) return res.status(403).json({ message: 'No company context for this user' });
  if (!tenantInitCache.has(companyId)) {
    await initTenantData(companyId);
    tenantInitCache.add(companyId);
  }
  next();
};

// --- AUTH ROUTES ---
app.get('/api/health', async (req, res) => {
  const dbStatus = mongoose.connection.readyState;
  const statusMap = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  res.json({ 
    status: 'ok', 
    database: statusMap[dbStatus] || 'unknown',
    env: {
      hasUri: !!process.env.MONGODB_URI,
      nodeEnv: process.env.NODE_ENV
    }
  });
});

// Root debug route
app.get('/ping', (req, res) => res.send('pong'));

app.get('/api/debug/users', authenticate, requireSuperAdmin, async (req, res) => {
  try {
    const users = await User.find({}, '-password').lean();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching users' });
  }
});

app.get('/api/debug/env', authenticate, requireSuperAdmin, (req, res) => {
  const keys = Object.keys(process.env).filter(k => 
    !k.includes('SECRET') && 
    !k.includes('KEY') && 
    !k.includes('PASSWORD') && 
    !k.includes('TOKEN')
  );
  res.json({ 
    envKeys: keys,
    hasMongoUri: !!process.env.MONGODB_URI,
    mongoUriPrefix: process.env.MONGODB_URI ? process.env.MONGODB_URI.substring(0, 10) + '...' : null
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ message: 'Internal server error', details: err.message });
});

app.post('/api/auth/login', async (req, res) => {
  let { username, password } = req.body;
  if (username) username = username.trim().toLowerCase();
  
  try {
    console.log(`Login attempt for username: [${username}]`);
    const user = await User.findOne({ username });
    if (!user) {
      const allUsers = await User.find({}, 'username').limit(5);
      console.log(`Login failed: User [${username}] not found. Sample of existing users:`, allUsers.map(u => u.username));
      return res.status(401).json({ message: 'Invalid username' });
    }

    if (!(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    if (user.role !== 'superadmin' && user.companyId) {
      const company = await Company.findById(user.companyId);
      if (!company) return res.status(403).json({ message: 'Associated company not found' });
      
      if (company.active === false) {
        return res.status(403).json({ message: 'This company account has been deactivated.' });
      }

      if (company.expiryDate) {
        const expiry = new Date(company.expiryDate);
        const now = new Date();
        if (expiry < now) {
          return res.status(403).json({ message: 'Your service has expired. Please contact your vendor.' });
        }
      }
    }

    const token = jwt.sign({ 
      id: user._id.toString(), 
      username: user.username, 
      role: user.role, 
      companyId: user.companyId ? user.companyId.toString() : null,
      assignedAccounts: user.assignedAccounts || []
    }, JWT_SECRET, { expiresIn: '1d' });

    console.log(`User logged in: ${user.username} (${user.role})`);

    res.json({ 
      token, 
      user: { 
        id: user._id.toString(), 
        username: user.username, 
        role: user.role, 
        companyId: user.companyId ? user.companyId.toString() : null,
        assignedAccounts: user.assignedAccounts || []
      } 
    });
  } catch (err) {
    console.error('Login error detailed:', err);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// --- SUPER ADMIN ROUTES ---
app.get('/api/admin/companies', authenticate, requireSuperAdmin, async (req, res) => {
  try {
    const companies = await Company.find().populate('ownerId', 'username password').lean();
    const result = companies.map((c) => ({
      ...c,
      id: c._id.toString(),
      username: c.ownerId ? c.ownerId.username : '',
      password: c.ownerId ? c.ownerId.password : ''
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/admin/agents', authenticate, requireSuperAdmin, async (req, res) => {
  try {
    const agents = await User.find({ role: 'agent' }).lean();
    const companyIds = [...new Set(agents.filter(a => a.companyId).map(a => a.companyId))];
    const companies = await Company.find({ _id: { $in: companyIds } }).lean();
    const companyMap = companies.reduce((map, c) => ({ ...map, [c._id.toString()]: c.name }), {});
    const result = agents.map((a) => ({
      ...a,
      id: a._id.toString(),
      companyName: companyMap[a.companyId] || 'Unknown'
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/admin/agents', authenticate, requireSuperAdmin, async (req, res) => {
  let { name, mobile, username, password, companyId, active } = req.body;
  if (username) username = username.trim().toLowerCase();
  try {
    if (await User.findOne({ username })) return res.status(400).json({ message: 'Username already exists' });
    const agent = await User.create({
      name, mobile, username, 
      password: bcrypt.hashSync(password, 10),
      role: 'agent', companyId, active: active !== undefined ? active : true
    });
    res.status(201).json(agent);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/admin/agents/:id', authenticate, requireSuperAdmin, async (req, res) => {
  const { id } = req.params;
  let { name, mobile, username, password, companyId, active } = req.body;
  if (username) username = username.trim().toLowerCase();
  try {
    const agent = await User.findById(id);
    if (!agent) return res.status(404).json({ message: 'Agent not found' });

    agent.name = name;
    agent.mobile = mobile;
    agent.username = username;
    agent.companyId = companyId;
    agent.active = active;

    if (password && !password.startsWith('$2')) {
      agent.password = bcrypt.hashSync(password, 10);
    } else if (password) {
      agent.password = password;
    }

    await agent.save();
    res.json(agent);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/admin/agents/:id', authenticate, requireSuperAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findOne({ _id: id, role: 'agent' });
    if (!user) return res.status(404).json({ message: 'Agent not found' });
    await User.findByIdAndDelete(id);
    res.json({ message: 'Agent account deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.patch('/api/admin/companies/:id/status', authenticate, requireSuperAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const company = await Company.findById(id);
    if (!company) return res.status(404).json({ message: 'Company not found' });
    company.active = !company.active;
    await company.save();
    res.json({ message: `Company ${company.active ? 'activated' : 'deactivated'}`, company });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/admin/companies', authenticate, requireSuperAdmin, async (req, res) => {
  let { name, username, password, startDate, expiryDate, amcAmount, amcStatus } = req.body;
  if (username) username = username.trim().toLowerCase();
  
  console.log(`Attempting to create company: [${name}] with owner: [${username}]`);
  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      console.log(`Company creation failed: Username [${username}] already exists`);
      return res.status(400).json({ message: 'Username already exists' });
    }

    const company = await Company.create({ name, startDate, expiryDate, amcAmount, amcStatus });
    console.log(`Company created with ID: ${company._id}`);

    const owner = await User.create({
      username, 
      password: bcrypt.hashSync(password, 10), 
      role: 'company_owner', 
      companyId: company._id.toString()
    });
    console.log(`Owner created with ID: ${owner._id}`);

    company.ownerId = owner._id;
    await company.save();
    
    console.log(`Initializing tenant data for ${company._id}`);
    await initTenantData(company._id.toString());
    console.log(`Tenant data initialized for ${company._id}`);

    res.status(201).json(company);
  } catch (err) {
    console.error('Company creation error:', err);
    res.status(500).json({ message: 'Server error during company creation', details: err.message });
  }
});

app.put('/api/admin/companies/:id', authenticate, requireSuperAdmin, async (req, res) => {
  const { id } = req.params;
  let { name, username, password, startDate, expiryDate, amcAmount, amcStatus } = req.body;
  if (username) username = username.trim().toLowerCase();
  try {
    const company = await Company.findById(id);
    if (!company) return res.status(404).json({ message: 'Company not found' });

    company.name = name;
    company.startDate = startDate;
    company.expiryDate = expiryDate;
    company.amcAmount = amcAmount;
    company.amcStatus = amcStatus;
    await company.save();

    const user = await User.findById(company.ownerId);
    if (user) {
      if (username) user.username = username;
      if (password) {
        if (!password.startsWith('$2')) {
          user.password = bcrypt.hashSync(password, 10);
        } else {
          user.password = password;
        }
      }
      await user.save();
    }
    res.json(company);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/admin/companies/:id', authenticate, requireSuperAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const company = await Company.findById(id);
    if (!company) return res.status(404).json({ message: 'Company not found' });

    // 1. Delete all users associated with this company
    await User.deleteMany({ companyId: id });
    // 2. Delete all other tenant data (this is a hard delete)
    await Customer.deleteMany({ companyId: id });
    await Account.deleteMany({ companyId: id });
    await Transaction.deleteMany({ companyId: id });
    await Group.deleteMany({ companyId: id });
    await AccountType.deleteMany({ companyId: id });
    // 3. Delete the company itself
    await Company.findByIdAndDelete(id);

    res.json({ message: 'Company and all associated data permanently deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// --- TENANT ROUTES ---
app.get('/api/tenant/summary', authenticate, injectTenantContext, async (req, res) => {
  const companyId = req.user.companyId;
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [customerCount, accountCount, cashAcc, recentTransactions, company, todayStats, lifeStats] = await Promise.all([
      Customer.countDocuments({ companyId }),
      Account.countDocuments({ companyId }),
      Account.findOne({ companyId, type: 'cash' }),
      Transaction.find({ companyId }).sort({ date: -1 }).limit(10).lean(),
      Company.findById(companyId),
      Transaction.aggregate([
        { $match: { companyId, date: { $gte: today } } },
        {
          $group: {
            _id: null,
            todayReceipt: { $sum: { $cond: [{ $in: ['$type', ['deposit', 'repay_princ', 'collection', 'income', 'receipt']] }, '$amt', 0] } },
            todayIncome: { $sum: { $cond: [{ $in: ['$type', ['income', 'receipt']] }, '$amt', 0] } },
            todayExpense: { $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amt', 0] } },
            count: { $sum: 1 }
          }
        }
      ]),
      Transaction.aggregate([
        { $match: { companyId } },
        {
          $group: {
            _id: null,
            totalIncome: { $sum: { $cond: [{ $in: ['$type', ['income', 'receipt']] }, '$amt', 0] } },
            totalExpense: { $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amt', 0] } }
          }
        }
      ])
    ]);

    const statsToday = todayStats[0] || { todayReceipt: 0, todayIncome: 0, todayExpense: 0, count: 0 };
    const statsLife = lifeStats[0] || { totalIncome: 0, totalExpense: 0 };

    res.json({
      companyName: company ? company.name : 'Business Dashboard',
      totalCustomers: customerCount,
      totalAccounts: accountCount,
      cashInHand: cashAcc ? cashAcc.balance : 0,
      todayReceipt: statsToday.todayReceipt,
      todayIncome: statsToday.todayIncome,
      todayExpense: statsToday.todayExpense,
      totalIncome: statsLife.totalIncome,
      totalExpense: statsLife.totalExpense,
      todayCount: statsToday.count,
      profit: statsLife.totalIncome - statsLife.totalExpense,
      recentTransactions: recentTransactions.map(t => ({ ...t, id: t._id })),
      expiryDate: company ? company.expiryDate : null
    });
  } catch (err) {
    console.error('Summary Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/customers', authenticate, injectTenantContext, async (req, res) => {
  try {
    const customers = await Customer.find({ companyId: req.user.companyId }).lean();
    const customerIds = customers.map(c => c._id.toString());
    const accounts = await Account.find({ companyId: req.user.companyId, customerId: { $in: customerIds } });
    
    const countMap = {};
    accounts.forEach(acc => {
      if (acc.customerId) {
        countMap[acc.customerId] = (countMap[acc.customerId] || 0) + 1;
      }
    });

    res.json(customers.map(c => ({ 
      ...c, 
      id: c._id.toString(),
      accCount: countMap[c._id.toString()] || 0
    })));
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/customers', authenticate, injectTenantContext, async (req, res) => {
  const companyId = req.user.companyId;
  try {
    const count = await Customer.countDocuments({ companyId });
    const custNo = 'CUST' + (count + 1).toString().padStart(4, '0');
    const customer = await Customer.create({ companyId, custNo, ...req.body });
    res.status(201).json(customer);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/customers/:id', authenticate, injectTenantContext, async (req, res) => {
  try {
    const oldCustomer = await Customer.findOne({ _id: req.params.id, companyId: req.user.companyId });
    const customer = await Customer.findOneAndUpdate(
      { _id: req.params.id, companyId: req.user.companyId },
      req.body,
      { new: true }
    );
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    
    // Update linked account names if customer name changed
    if (req.body.name && oldCustomer && oldCustomer.name !== req.body.name) {
      const accounts = await Account.find({ customerId: req.params.id, companyId: req.user.companyId });
      for (const acc of accounts) {
        if (acc.name.includes(oldCustomer.name)) {
          acc.name = acc.name.replace(oldCustomer.name, req.body.name);
          await acc.save();
        }
      }
    }
    
    res.json(customer);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/customers/:id', authenticate, injectTenantContext, async (req, res) => {
  try {
    await Customer.findOneAndDelete({ _id: req.params.id, companyId: req.user.companyId });
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/accounts', authenticate, injectTenantContext, async (req, res) => {
  const { customerId } = req.query;
  const filter = { companyId: req.user.companyId };
  if (customerId) filter.customerId = customerId;

  try {
    const accounts = await Account.find(filter).lean();
    res.json(accounts.map(a => ({ ...a, id: a._id.toString() })));
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/accounts/:id', authenticate, injectTenantContext, async (req, res) => {
  try {
    const account = await Account.findOneAndUpdate(
      { _id: req.params.id, companyId: req.user.companyId },
      { $set: req.body },
      { new: true }
    );
    if (!account) return res.status(404).json({ message: 'Account not found' });
    res.json({ ...account.toObject(), id: account._id });
  } catch (err) {
    console.error('Update Account Error:', err);
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
});

app.delete('/api/accounts/:id', authenticate, injectTenantContext, async (req, res) => {
  try {
    const account = await Account.findOne({ _id: req.params.id, companyId: req.user.companyId });
    if (!account) return res.status(404).json({ message: 'Account not found' });

    // Check for non-zero balance
    if (account.balance !== 0) {
      return res.status(400).json({ message: 'Cannot delete account with a non-zero balance. Current balance: ₹' + account.balance });
    }

    // Check for transactions
    const txCount = await Transaction.countDocuments({ 
      companyId: req.user.companyId, 
      $or: [{ accId: req.params.id }, { secAccId: req.params.id }] 
    });
    
    if (txCount > 0) {
      return res.status(400).json({ message: 'Cannot delete account with existing transactions. Please inactivate it instead for record keeping.' });
    }

    await Account.findOneAndDelete({ _id: req.params.id, companyId: req.user.companyId });
    res.status(200).json({ message: 'Account deleted successfully' });
  } catch (err) {
    console.error('Delete Account Error:', err);
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
});

app.post('/api/accounts', authenticate, injectTenantContext, async (req, res) => {
  const companyId = req.user.companyId;
  const { type } = req.body;
  try {
    const typeInfo = await AccountType.findOne({ companyId, name: type });
    const prefix = typeInfo ? typeInfo.prefix : 'ACC';
    const group = typeInfo ? typeInfo.group : (req.body.group || 'General');
    
    const sameTypeCount = await Account.countDocuments({ companyId, accNo: new RegExp(`^${prefix}`) });
    const accNo = `${prefix}${(sameTypeCount + 1).toString().padStart(5, '0')}`;
    
    const account = await Account.create({ 
      companyId, 
      accNo, 
      group,
      balance: 0, 
      status: 'active', 
      ...req.body 
    });
    res.status(201).json({ ...account.toObject(), id: account._id });
  } catch (err) {
    console.error('Create Account Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});
// Add this near other Account routes in your backend file
app.patch('/api/accounts/:id/status', authenticate, injectTenantContext, async (req, res) => {
  try {
    const account = await Account.findOne({ _id: req.params.id, companyId: req.user.companyId });
    if (!account) return res.status(404).json({ message: 'Account not found' });
    
    // Toggle status
    const newStatus = account.status === 'active' ? 'inactive' : 'active';
    
    // Constraint: Can only deactivate if balance is 0
    if (newStatus === 'inactive' && account.balance !== 0) {
      return res.status(400).json({ message: 'Account balance must be 0 before it can be deactivated' });
    }

    const updatedAccount = await Account.findOneAndUpdate(
      { _id: req.params.id, companyId: req.user.companyId },
      { $set: { status: newStatus } },
      { new: true }
    );
    
    res.json({ 
      message: `Account is now ${updatedAccount.status}`, 
      status: updatedAccount.status,
      id: updatedAccount._id 
    });
  } catch (err) {
    console.error('Toggle Status Error:', err);
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
});

app.get('/api/transactions', authenticate, injectTenantContext, async (req, res) => {
  try {
    const transactions = await Transaction.find({ companyId: req.user.companyId }).lean();
    res.json(transactions.map(t => ({ ...t, id: t._id.toString() })));
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/transactions', authenticate, injectTenantContext, async (req, res) => {
  const companyId = req.user.companyId;
  const { accId, secAccId, type, amt } = req.body;
  try {
    const primaryAcc = await Account.findOne({ _id: accId, companyId });
    const secondaryAcc = await Account.findOne({ _id: secAccId, companyId });

    if (!primaryAcc || !secondaryAcc) return res.status(404).json({ message: 'Account not found' });

    const amount = parseFloat(amt);
    
    const getModifier = async (acc) => {
      let g = await Group.findOne({ name: acc.group, companyId });
      let accType = g ? g.type : acc.type;
      
      if (!accType) {
         // Fallback to keywords to ensure correct Debit/Credit behavior for common labels
         const name = (acc.group || acc.name || '').toUpperCase();
         const assetKeywords = ['ASSET', 'LOAN', 'CASH', 'BANK', 'EQUIPMENT', 'FURNITURE', 'VEHICLE', 'PROPERTY', 'LN', 'ADVANCE', 'GOLD', 'INTERNAL', 'CASH IN HAND'];
         const expenseKeywords = ['EXPENSE', 'SALARY', 'RENT', 'INTEREST PAID', 'REPAIR', 'ALLOWANCE'];
         if (assetKeywords.some(kw => name.includes(kw))) accType = 'Asset';
         else if (expenseKeywords.some(kw => name.includes(kw))) accType = 'Expense';
         else accType = 'Liability'; // Default to liability/equity behavior (Credit +)
      }

      // Assets and Expenses increment on Debit (+), Liabilities/Equity/Income increment on Credit (+)
      return (accType === 'Asset' || accType === 'Expense') ? 1 : -1;
    };

    const primaryMode = await getModifier(primaryAcc);
    const secondaryMode = await getModifier(secondaryAcc);

    // Determine direction:
    // Debit Primary: Involves increasing an Asset (Loan Given, Bank Inflow) or decreasing a Liability (Withdrawal from Savings)
    const debitTypes = ['withdraw', 'loan_disbursement', 'expense', 'adjustment', 'transfer'];
    let isDebitPrimary = debitTypes.includes(type);

    if (isDebitPrimary) {
      // Primary is DEBIT (+ for Assets, - for Liabilities), Secondary is CREDIT (- for Assets, + for Liabilities)
      primaryAcc.balance += (amount * primaryMode);
      secondaryAcc.balance += (amount * secondaryMode * -1);
    } else {
      // Secondary is DEBIT, Primary is CREDIT
      secondaryAcc.balance += (amount * secondaryMode);
      primaryAcc.balance += (amount * primaryMode * -1);
    }

    await primaryAcc.save();
    await secondaryAcc.save();

    const txCount = await Transaction.countDocuments({ companyId });
    const voucherNo = (txCount + 1).toString().padStart(2, '0');

    const transaction = await Transaction.create({ 
      companyId, 
      ...req.body,
      voucherNo 
    });
    res.status(201).json({ ...transaction.toObject(), id: transaction._id });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/transactions/:id', authenticate, injectTenantContext, async (req, res) => {
  const companyId = req.user.companyId;
  try {
    const tx = await Transaction.findOne({ _id: req.params.id, companyId });
    if (!tx) return res.status(404).json({ message: 'Transaction not found' });

    const primaryAcc = await Account.findOne({ _id: tx.accId, companyId });
    const secondaryAcc = await Account.findOne({ _id: tx.secAccId, companyId });

    if (primaryAcc && secondaryAcc) {
      const amount = tx.amt;
      
      const getModifier = async (acc) => {
        let g = await Group.findOne({ name: acc.group, companyId });
        let accType = g ? g.type : acc.type;
        if (!accType) {
          const name = (acc.group || acc.name || '').toUpperCase();
          const assetKeywords = ['ASSET', 'LOAN', 'CASH', 'BANK', 'EQUIPMENT', 'FURNITURE', 'VEHICLE', 'PROPERTY', 'LN', 'ADVANCE', 'GOLD', 'INTERNAL', 'CASH IN HAND'];
          const expenseKeywords = ['EXPENSE', 'SALARY', 'RENT', 'INTEREST PAID', 'REPAIR'];
          if (assetKeywords.some(kw => name.includes(kw))) accType = 'Asset';
          else if (expenseKeywords.some(kw => name.includes(kw))) accType = 'Expense';
          else accType = 'Liability';
        }
        return (accType === 'Asset' || accType === 'Expense') ? 1 : -1;
      };

      const primaryMode = await getModifier(primaryAcc);
      const secondaryMode = await getModifier(secondaryAcc);

      const debitTypes = ['withdraw', 'loan_disbursement', 'expense', 'adjustment', 'transfer'];
      let isDebitPrimary = debitTypes.includes(tx.type);

      if (isDebitPrimary) {
        // Reverse what was done in create
        primaryAcc.balance -= (tx.amt * primaryMode);
        secondaryAcc.balance -= (tx.amt * secondaryMode * -1);
      } else {
        secondaryAcc.balance -= (tx.amt * secondaryMode);
        primaryAcc.balance -= (tx.amt * primaryMode * -1);
      }
      await primaryAcc.save();
      await secondaryAcc.save();
    }

    await Transaction.findByIdAndDelete(tx._id);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/groups', authenticate, injectTenantContext, async (req, res) => {
  try {
    const groups = await Group.find({ companyId: req.user.companyId }).lean();
    res.json(groups.map(g => ({ ...g, id: g._id.toString() })));
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/groups', authenticate, injectTenantContext, async (req, res) => {
  try {
    const group = await Group.create({ companyId: req.user.companyId, ...req.body });
    res.status(201).json(group);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/groups/:id', authenticate, injectTenantContext, async (req, res) => {
  try {
    const group = await Group.findOneAndUpdate(
      { _id: req.params.id, companyId: req.user.companyId },
      req.body,
      { new: true }
    );
    if (!group) return res.status(404).json({ message: 'Group not found' });
    res.json(group);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/groups/:id', authenticate, injectTenantContext, async (req, res) => {
  try {
    await Group.findOneAndDelete({ _id: req.params.id, companyId: req.user.companyId });
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// --- FACTORY RESET ---
app.post('/api/tenant/reset/:target', authenticate, injectTenantContext, async (req, res) => {
  const companyId = req.user.companyId;
  const { target } = req.params;

  try {
    if (target === 'transactions') {
      // Delete all transactions
      await Transaction.deleteMany({ companyId });
      // Reset all account balances to zero
      await Account.updateMany({ companyId }, { $set: { balance: 0 } });
      res.json({ message: 'All transaction history has been cleared. All balances reset to 0.' });
    } else if (target === 'customers') {
      // 1. Delete all transactions
      await Transaction.deleteMany({ companyId });
      // 2. Delete all accounts that are NOT system accounts (cash/bank)
      await Account.deleteMany({ companyId, type: { $nin: ['cash', 'bank'] } });
      // 3. Delete all customers
      await Customer.deleteMany({ companyId });
      // 4. Reset system account balances
      await Account.updateMany({ companyId, type: { $in: ['cash', 'bank'] } }, { $set: { balance: 0 } });
      
      res.json({ message: 'All customers, custom accounts, and transactions have been permanently deleted.' });
    } else if (target === 'full') {
      // COMPLETE PURGE
      await Transaction.deleteMany({ companyId });
      await Account.deleteMany({ companyId });
      await Customer.deleteMany({ companyId });
      await Group.deleteMany({ companyId });
      await AccountType.deleteMany({ companyId });
      
      // RE-INITIALIZE
      await initTenantData(companyId);
      
      res.json({ message: 'System has been fully reset to factory defaults. All data purged.' });
    } else {
      res.status(400).json({ message: 'Invalid reset target.' });
    }
  } catch (err) {
    console.error('Reset Error:', err);
    res.status(500).json({ message: 'Server error during factory reset.' });
  }
});

app.get('/api/account-types', authenticate, injectTenantContext, async (req, res) => {
  try {
    const types = await AccountType.find({ companyId: req.user.companyId }).lean();
    res.json(types.map(t => ({ ...t, id: t._id.toString() })));
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/account-types', authenticate, injectTenantContext, async (req, res) => {
  try {
    const type = await AccountType.create({ companyId: req.user.companyId, ...req.body });
    res.status(201).json(type);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/account-types/:id', authenticate, injectTenantContext, async (req, res) => {
  try {
    const type = await AccountType.findOneAndUpdate(
      { _id: req.params.id, companyId: req.user.companyId },
      req.body,
      { new: true }
    );
    if (!type) return res.status(404).json({ message: 'Account type not found' });
    res.json(type);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/account-types/:id', authenticate, injectTenantContext, async (req, res) => {
  try {
    await AccountType.findOneAndDelete({ _id: req.params.id, companyId: req.user.companyId });
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/agents', authenticate, injectTenantContext, async (req, res) => {
  try {
    // Only owners should see the full agent list for management
    // But if we want agents to see themselves or others for some reason, we can adjust.
    // Usually, manage-agents should be for owners.
    if (req.user.role === 'agent') return res.status(403).json({ message: 'Agents cannot access agent management' });
    
    const agents = await User.find({ companyId: req.user.companyId, role: 'agent' }).lean();
    res.json(agents.map(a => ({ ...a, id: a._id.toString() })));
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/agents/:id', authenticate, injectTenantContext, async (req, res) => {
  try {
    if (req.user.role === 'agent') return res.status(403).json({ message: 'Agents cannot modify agent data' });
    
    const { name, mobile, username, password, assignedAccounts } = req.body;
    const agent = await User.findOne({ _id: req.params.id, companyId: req.user.companyId, role: 'agent' });
    if (!agent) return res.status(404).json({ message: 'Agent not found' });

    if (name) agent.name = name;
    if (mobile) agent.mobile = mobile;
    if (username) {
      const collision = await User.findOne({ username: username.toLowerCase(), _id: { $ne: req.params.id } });
      if (collision) return res.status(400).json({ message: 'Username already taken' });
      agent.username = username.toLowerCase();
    }
    if (password) agent.password = await bcrypt.hash(password, 10);
    if (assignedAccounts) agent.assignedAccounts = assignedAccounts;

    await agent.save();
    res.json({ message: 'Agent updated', agent });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/agents/:id', authenticate, injectTenantContext, async (req, res) => {
  try {
    if (req.user.role === 'agent') return res.status(403).json({ message: 'Agents cannot delete agent data' });
    
    const agent = await User.findOne({ _id: req.params.id, companyId: req.user.companyId, role: 'agent' });
    if (!agent) return res.status(404).json({ message: 'Agent not found' });
    
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Agent deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/agents', authenticate, injectTenantContext, async (req, res) => {
  try {
    if (req.user.role === 'agent') return res.status(403).json({ message: 'Agents cannot create new agents' });

    let { username } = req.body;
    if (username) username = username.trim().toLowerCase();
    else username = '';

    if (await User.findOne({ username })) {
      return res.status(400).json({ message: 'Username already exists' });
    }
    const agent = await User.create({
      ...req.body,
      username,
      password: bcrypt.hashSync(req.body.password, 10),
      companyId: req.user.companyId,
      role: 'agent'
    });
    res.status(201).json(agent);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/tenant/profile', authenticate, injectTenantContext, async (req, res) => {
  try {
    const company = await Company.findById(req.user.companyId);
    const owner = await User.findById(company.ownerId);
    res.json({
      name: company ? company.name : '',
      logo: company ? company.logo : '',
      phone: owner ? owner.mobile : '',
      email: owner ? owner.username : ''
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/tenant/profile', authenticate, injectTenantContext, async (req, res) => {
  const { name, phone, email, logo } = req.body;
  try {
    const company = await Company.findById(req.user.companyId);
    if (company) {
      if (name) company.name = name;
      if (logo !== undefined) company.logo = logo;
      await company.save();
    }

    const owner = await User.findById(company.ownerId);
    if (owner) {
      if (phone) owner.mobile = phone;
      await owner.save();
    }

    res.json({ message: 'Profile updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// --- VITE MIDDLEWARE ---
async function start() {
  await connectDB();
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
    app.get('*', async (req, res, next) => {
      try {
        let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(req.originalUrl, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    const distPath = path.join(__dirname, '../Frontend/dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => res.sendFile(path.join(distPath, 'index.html')));
  }
  app.listen(PORT, '0.0.0.0', () => console.log(`Server running at http://localhost:${PORT}`));
}
start();
