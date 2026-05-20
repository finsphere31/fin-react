export default function notFound(req, res) {
  console.warn(`[${new Date().toISOString()}] 404 Not Found:`, req.path);
  res.status(404).json({ 
    success: false,
    message: `Route not found: ${req.method} ${req.path}` 
  });
}
