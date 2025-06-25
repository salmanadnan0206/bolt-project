// Standalone webhook testing function
export const sendWebhookTest = async () => {
  try {
    const response = await fetch("https://itexpert2210.app.n8n.cloud/webhook-test/cc92b7f6-a83f-4275-a822-07d217c63716", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        test: "webhook connection", 
        timestamp: new Date().toISOString() 
      }),
    });
    
    const data = await response.json();
    console.log("Success:", data);
    return data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

// Full webhook test with form data
export const sendWebhookWithFormData = async (formData: {
  agentName: string;
  primaryFunction: string;
  knowledgeResources: string[];
  sampleScenarios: string;
  toneAndConduct: string;
}) => {
  try {
    // Clean and format the data
    const cleanedData = {
      agentName: formData.agentName.trim(),
      primaryFunction: formData.primaryFunction.trim(),
      knowledgeResources: formData.knowledgeResources
        .filter(resource => resource.trim() !== '')
        .map(resource => resource.trim()),
      sampleScenarios: formData.sampleScenarios.trim(),
      toneAndConduct: formData.toneAndConduct.trim()
    };

    const response = await fetch("https://itexpert2210.app.n8n.cloud/webhook-test/cc92b7f6-a83f-4275-a822-07d217c63716", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(cleanedData),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log("Success:", data);
    return data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};