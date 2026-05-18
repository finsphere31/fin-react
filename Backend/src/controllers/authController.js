import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'replace-with-a-secret';
const JWT_EXPIRES_IN = '8h';

function createToken(user) {
  return jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

export async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  const demoUser = {
    id: 'demo-user',
    email,
    name: 'Demo User',
    role: 'admin',
  };

  const token = createToken(demoUser);

  return res.json({
    user: demoUser,
    token,
  });
}
