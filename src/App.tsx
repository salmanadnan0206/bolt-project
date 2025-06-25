import React, { useState } from 'react';
import { Bot, Zap, Edit3, Copy, Plus, X, ChevronDown, AlertCircle, TestTube } from 'lucide-react';
import { sendWebhookTest, sendWebhookWithFormData } from './utils/webhookTest';

interface FormData {
  agentName: string;
  primaryFunction: string;
  knowledgeResources: string[];
  sampleScenarios: string;
  toneAndConduct: string;
}

function App() {
  const [formData, setFormData] = useState<FormData>({
    agentName: '',
    primaryFunction: '',
    knowledgeResources: [''],
    sampleScenarios: '',
    toneAndConduct: ''
  });

  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [error, setError] = useState<string>('');
  const [expandedSections, setExpandedSections] = useState({
    agentName: true,
    primaryFunction: true,
    knowledgeResources: true,
    sampleScenarios: true,
    toneAndConduct: true
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const addKnowledgeResource = () => {
    setFormData(prev => ({
      ...prev,
      knowledgeResources: [...prev.knowledgeResources, '']
    }));
  };

  const removeKnowledgeResource = (index: number) => {
    setFormData(prev => ({
      ...prev,
      knowledgeResources: prev.knowledgeResources.filter((_, i) => i !== index)
    }));
  };

  const updateKnowledgeResource = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      knowledgeResources: prev.knowledgeResources.map((resource, i) => 
        i === index ? value : resource
      )
    }));
  };

  const testWebhookConnection = async () => {
    setIsTesting(true);
    setError('');
    
    try {
      const result = await sendWebhookTest();
      console.log('Webhook test successful:', result);
      alert('Webhook connection test successful! Check console for details.');
    } catch (error) {
      console.error('Webhook test failed:', error);
      setError(`Webhook test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsTesting(false);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError('');
    setGeneratedPrompt('');
    
    try {
      // Clean and format the data properly
      const cleanedFormData = {
        agentName: formData.agentName.trim(),
        primaryFunction: formData.primaryFunction.trim(),
        knowledgeResources: formData.knowledgeResources
          .filter(resource => resource.trim() !== '')
          .map(resource => resource.trim()),
        sampleScenarios: formData.sampleScenarios.trim(),
        toneAndConduct: formData.toneAndConduct.trim()
      };

      console.log('Sending cleaned payload:', cleanedFormData);

      // Try the direct webhook first
      try {
        const result = await sendWebhookWithFormData(cleanedFormData);
        setGeneratedPrompt(typeof result === 'string' ? result : JSON.stringify(result, null, 2));
        return;
      } catch (directError) {
        console.log('Direct webhook failed, trying proxy:', directError);
      }

      // Fallback to proxy
      const response = await fetch('/api/generate-prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json, text/plain, */*',
        },
        body: JSON.stringify(cleanedFormData)
      });

      console.log('Proxy response status:', response.status);

      if (response.ok) {
        const contentType = response.headers.get('content-type');
        let result;
        
        if (contentType && contentType.includes('application/json')) {
          const jsonResult = await response.json();
          result = typeof jsonResult === 'string' ? jsonResult : JSON.stringify(jsonResult, null, 2);
        } else {
          result = await response.text();
        }
        
        console.log('Response result:', result);
        setGeneratedPrompt(result);
      } else {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        
        let errorMessage = '';
        if (response.status === 500) {
          errorMessage = `Internal Server Error (500): The webhook endpoint is experiencing issues.\n\nThis typically means:\n• The n8n.cloud workflow has an error\n• The webhook URL may be incorrect\n• The workflow expects different data format\n\nPlease check your n8n.cloud workflow logs for more details.`;
        } else if (response.status === 404) {
          errorMessage = `Webhook Not Found (404): The webhook endpoint could not be found.\n\nPlease verify the webhook URL is correct.`;
        } else if (response.status === 403) {
          errorMessage = `Access Forbidden (403): The webhook endpoint denied access.\n\nPlease check if the webhook is properly configured and active.`;
        } else {
          errorMessage = `HTTP ${response.status}: ${response.statusText}\n\n${errorText}`;
        }
        
        setError(errorMessage);
      }
    } catch (error) {
      console.error('Network error details:', error);
      
      let errorMessage = '';
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        errorMessage = 'Network Error: Unable to connect to the webhook endpoint.\n\nThis could be due to:\n• CORS restrictions\n• Network connectivity issues\n• The webhook endpoint being offline\n\nPlease check your internet connection and verify the webhook is accessible.';
      } else {
        errorMessage = `Network error: ${error instanceof Error ? error.message : 'Unknown error occurred'}\n\nPlease check:\n1. Your internet connection\n2. The webhook URL is correct\n3. The webhook endpoint is online and accessible`;
      }
      
      setError(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedPrompt);
      console.log('Copied to clipboard');
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const editPrompt = () => {
    alert('Edit functionality would open a rich text editor');
  };

  const clearError = () => {
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">AI Agent Designer</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={testWebhookConnection}
              disabled={isTesting}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded-lg transition-colors text-sm"
            >
              {isTesting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Testing...
                </>
              ) : (
                <>
                  <TestTube className="w-4 h-4" />
                  Test Webhook
                </>
              )}
            </button>
            <button className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
              <span>← Back to Main Website</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Left Panel - Design Your AI Agent */}
        <div className="w-1/2 bg-gray-900 border-r border-gray-700 overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Bot className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold">Design Your AI Agent</h2>
            </div>

            <div className="space-y-6">
              {/* Agent Name */}
              <div className="space-y-3">
                <button
                  onClick={() => toggleSection('agentName')}
                  className="flex items-center justify-between w-full text-left"
                >
                  <label className="text-sm font-medium text-gray-300">
                    Agent Name <span className="text-red-400">*</span>
                  </label>
                  <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.agentName ? 'rotate-180' : ''}`} />
                </button>
                {expandedSections.agentName && (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={formData.agentName}
                      onChange={(e) => setFormData(prev => ({ ...prev, agentName: e.target.value }))}
                      placeholder="Agent"
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    />
                    <p className="text-xs text-gray-500">Enter a clear, descriptive name for your AI agent</p>
                  </div>
                )}
              </div>

              {/* Agent's Primary Function */}
              <div className="space-y-3">
                <button
                  onClick={() => toggleSection('primaryFunction')}
                  className="flex items-center justify-between w-full text-left"
                >
                  <label className="text-sm font-medium text-gray-300">
                    Agent's Primary Function <span className="text-red-400">*</span>
                  </label>
                  <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.primaryFunction ? 'rotate-180' : ''}`} />
                </button>
                {expandedSections.primaryFunction && (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={formData.primaryFunction}
                      onChange={(e) => setFormData(prev => ({ ...prev, primaryFunction: e.target.value }))}
                      placeholder="Handle customer inquires"
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    />
                    <p className="text-xs text-gray-500">Describe the main tasks and responsibilities of your agent</p>
                  </div>
                )}
              </div>

              {/* Available Knowledge Resources */}
              <div className="space-y-3">
                <button
                  onClick={() => toggleSection('knowledgeResources')}
                  className="flex items-center justify-between w-full text-left"
                >
                  <label className="text-sm font-medium text-gray-300">Available Knowledge Resources</label>
                  <div className="flex items-center gap-2">
                    <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.knowledgeResources ? 'rotate-180' : ''}`} />
                  </div>
                </button>
                {expandedSections.knowledgeResources && (
                  <div className="space-y-3">
                    {formData.knowledgeResources.map((resource, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={resource}
                          onChange={(e) => updateKnowledgeResource(index, e.target.value)}
                          placeholder="We offer software services for productivity, security, and business management"
                          className="flex-1 px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        />
                        {formData.knowledgeResources.length > 1 && (
                          <button
                            onClick={() => removeKnowledgeResource(index)}
                            className="p-3 text-gray-400 hover:text-red-400 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={addKnowledgeResource}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Add Knowledge Resource
                    </button>
                    <p className="text-xs text-gray-500">List any reference materials the agent should use (optional)</p>
                  </div>
                )}
              </div>

              {/* Sample Scenarios */}
              <div className="space-y-3">
                <button
                  onClick={() => toggleSection('sampleScenarios')}
                  className="flex items-center justify-between w-full text-left"
                >
                  <label className="text-sm font-medium text-gray-300">
                    Sample Scenarios <span className="text-red-400">*</span>
                  </label>
                  <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.sampleScenarios ? 'rotate-180' : ''}`} />
                </button>
                {expandedSections.sampleScenarios && (
                  <div className="space-y-2">
                    <textarea
                      value={formData.sampleScenarios}
                      onChange={(e) => setFormData(prev => ({ ...prev, sampleScenarios: e.target.value }))}
                      placeholder='Start with: "Hi there, this is Laura how can I help you today?"'
                      rows={4}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                    />
                    <p className="text-xs text-gray-500">Provide 2-3 examples of ideal interactions</p>
                  </div>
                )}
              </div>

              {/* Tone and Conduct */}
              <div className="space-y-3">
                <button
                  onClick={() => toggleSection('toneAndConduct')}
                  className="flex items-center justify-between w-full text-left"
                >
                  <label className="text-sm font-medium text-gray-300">
                    Tone and Conduct <span className="text-red-400">*</span>
                  </label>
                  <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.toneAndConduct ? 'rotate-180' : ''}`} />
                </button>
                {expandedSections.toneAndConduct && (
                  <div className="space-y-2">
                    <textarea
                      value={formData.toneAndConduct}
                      onChange={(e) => setFormData(prev => ({ ...prev, toneAndConduct: e.target.value }))}
                      placeholder="Professional, helpful, and empathetic"
                      rows={3}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                    />
                    <p className="text-xs text-gray-500">Define the personality and communication style</p>
                  </div>
                )}
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !formData.agentName || !formData.primaryFunction || !formData.sampleScenarios || !formData.toneAndConduct}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed py-4 rounded-lg font-semibold transition-all transform hover:scale-[1.02] disabled:hover:scale-100"
              >
                {isGenerating ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Generating...
                  </div>
                ) : (
                  'Generate'
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel - AI Generated Prompt */}
        <div className="w-1/2 bg-gray-900 overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-600 rounded-lg">
                  <Zap className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold">AI-Generated Prompt</h2>
              </div>

              {generatedPrompt && (
                <div className="flex gap-2">
                  <button
                    onClick={editPrompt}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-sm"
                  >
                    <Edit3 className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-sm"
                  >
                    <Copy className="w-4 h-4" />
                    Copy
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-300">Your AI-Generated Prompt</h3>
              
              {/* Error Display */}
              {error && (
                <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="text-red-400 font-medium mb-2">Generation Failed</h4>
                      <pre className="text-sm text-red-300 whitespace-pre-wrap font-mono leading-relaxed">
                        {error}
                      </pre>
                      <button
                        onClick={clearError}
                        className="mt-3 px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm transition-colors"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 min-h-[400px]">
                {generatedPrompt ? (
                  <pre className="whitespace-pre-wrap text-sm text-gray-200 font-mono leading-relaxed">
                    {generatedPrompt}
                  </pre>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center">
                      <Zap className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Fill out the form and click "Generate" to create your AI agent prompt</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;