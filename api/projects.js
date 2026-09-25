// Serverless Endpoint: GET/POST /api/projects
// Project State Storage & Retrieval Engine

const userProjectsStore = new Map();

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,DELETE');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GET: Fetch projects list
  if (req.method === 'GET') {
    const email = req.query?.ownerEmail || 'guest@cvrtn.com';
    const projects = Array.from(userProjectsStore.values()).filter(p => p.ownerEmail === email);
    return res.status(200).json({ success: true, count: projects.length, projects });
  }

  // POST: Save or update project
  if (req.method === 'POST') {
    try {
      const { projectId, name = 'Untitled Thumbnail', width = 1280, height = 720, canvasData = null, ownerEmail = 'guest@cvrtn.com' } = req.body || {};

      const id = projectId || `proj_${Date.now().toString(36)}`;
      const timestamp = new Date().toISOString();

      const projectRecord = {
        projectId: id,
        name: name.trim(),
        width: Number(width),
        height: Number(height),
        canvasData,
        ownerEmail,
        updatedAt: timestamp,
        createdAt: userProjectsStore.get(id)?.createdAt || timestamp
      };

      userProjectsStore.set(id, projectRecord);

      return res.status(200).json({
        success: true,
        message: `Project "${projectRecord.name}" saved successfully.`,
        project: projectRecord
      });

    } catch (err) {
      console.error('Save project error:', err);
      return res.status(500).json({ error: 'Failed to save project.', details: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed.' });
}
