# Webhook Testing

## Curl Command Format

```bash
curl -X POST https://itexpert2210.app.n8n.cloud/webhook-test/cc92b7f6-a83f-4275-a822-07d217c63716 \
  -H "Content-Type: application/json" \
  -d '{
    "agentName": "Customer Support Agent",
    "primaryFunction": "Handle customer inquiries and provide technical support",
    "knowledgeResources": [
      "We offer software services for productivity, security, and business management",
      "Our support hours are 9 AM to 6 PM EST",
      "We provide 24/7 emergency support for enterprise clients"
    ],
    "sampleScenarios": "Hi there, this is Laura how can I help you today?\n\nCustomer: I am having trouble with my software installation\nAgent: I would be happy to help you with that. Can you tell me which software you are trying to install and what specific error message you are seeing?\n\nCustomer: Thank you for your help\nAgent: You are very welcome! Is there anything else I can assist you with today?",
    "toneAndConduct": "Professional, helpful, and empathetic. Always maintain a friendly tone while being efficient and solution-focused."
  }'
```

## Simple Test Curl Command

```bash
curl -X POST https://itexpert2210.app.n8n.cloud/webhook-test/cc92b7f6-a83f-4275-a822-07d217c63716 \
  -H "Content-Type: application/json" \
  -d '{"test": "webhook connection", "timestamp": "2024-01-01T00:00:00Z"}'
```