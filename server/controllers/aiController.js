/*
 * Simple in-memory job system for AI generation. In a real deployment this
 * would be replaced with a message queue (e.g. Redis + BullMQ) and calls
 * to a ComfyUI server. For demonstration purposes jobs are simulated
 * locally: a job is created with a random ID, marked as processing and
 * completed after a short delay with placeholder images from picsum.photos.
 */

const jobs = {};
let nextJobId = 1;

/**
 * Return a list of available base models for the generator. Each model
 * contains an id, a human readable name and default parameters for
 * width/height/steps/cfg. Additional models can be added here or loaded
 * from configuration or environment variables.
 */
exports.getModels = async (req, res) => {
  const models = [
    {
      id: 'star3',
      name: '星流 Star-3',
      defaultParams: { width: 1024, height: 1024, steps: 25, cfg: 4.5 },
    },
    {
      id: 'sdxl',
      name: 'SDXL',
      defaultParams: { width: 1024, height: 1024, steps: 30, cfg: 7.5 },
    },
  ];
  res.json(models);
};

/**
 * Start a new AI generation job. The request should include a prompt
 * describing the desired image and optional parameters such as width,
 * height, batch (number of images), model id and other hyperparameters.
 * A job ID is returned immediately. The client should poll
 * `/api/ai/job/:id` until the job is completed or failed.
 */
exports.generateImage = async (req, res) => {
  const {
    prompt,
    width = 512,
    height = 512,
    batch = 1,
    model,
    negative,
    cfg,
    steps,
    seed,
  } = req.body;
  if (!prompt) {
    return res.status(400).json({ message: 'Prompt is required' });
  }
  const jobId = nextJobId++;
  jobs[jobId] = {
    status: 'processing',
    result: null,
  };
  // Simulate asynchronous generation. In a real implementation this would
  // enqueue a job and return immediately. Here we complete after 1s.
  setTimeout(() => {
    const images = [];
    for (let i = 0; i < batch; i += 1) {
      // Use picsum.photos to generate placeholder images of the requested size.
      const url = `https://picsum.photos/${width}/${height}?random=${Math.random()}`;
      images.push({ url });
    }
    jobs[jobId].status = 'completed';
    jobs[jobId].result = images;
  }, 1000);
  return res.json({ jobId });
};

/**
 * Poll the status of a previously created AI generation job. The job ID
 * must be supplied in the URL parameter. If the job exists its status
 * and result (if completed) are returned. If the job does not exist a
 * 404 response is returned. In a real implementation the status may
 * include progress information or error messages.
 */
exports.getJobStatus = async (req, res) => {
  const jobId = parseInt(req.params.id, 10);
  const job = jobs[jobId];
  if (!job) {
    return res.status(404).json({ message: 'Job not found' });
  }
  return res.json(job);
};

/**
 * Simple chat endpoints that provide a placeholder AI assistant. The
 * implementation is intentionally lightweight: it returns a static greeting
 * and echoes user messages. This structure can later be replaced with a real
 * conversational model.
 */

exports.getChatMessages = async (req, res) => {
  return res.json({
    messages: [
      {
        role: 'assistant',
        content: 'Hi, 我是你的AI设计师，让我们开始今天的创作吧！',
      },
    ],
  });
};

exports.chatReply = async (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ message: 'Message is required' });
  }
  // In a real implementation this would call an LLM service.
  const reply = `你刚才说：“${message}”`;
  return res.json({ reply });
};

/**
 * The following endpoints are placeholders for additional AI functionality
 * such as inpainting, enhancement and harmonization. They currently
 * return a 501 response and should be implemented by integrating
 * ComfyUI or another backend. See README for guidance.
 */
exports.inpaint = async (req, res) => {
  return res.status(501).json({ message: 'AI inpainting is not implemented' });
};

exports.enhance = async (req, res) => {
  return res.status(501).json({ message: 'AI enhancement is not implemented' });
};

exports.harmonize = async (req, res) => {
  return res.status(501).json({ message: 'AI harmonization is not implemented' });
};