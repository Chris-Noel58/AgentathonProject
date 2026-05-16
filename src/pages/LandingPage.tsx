import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Send, CheckCircle2 } from "lucide-react";
import Markdown from "react-markdown";

export default function LandingPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [selectedDocId, setSelectedDocId] = useState("");
  const [viewingPdfUrl, setViewingPdfUrl] = useState<string | null>(null);
  
  // Chat state
  const [query, setQuery] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm your Kenya Civic Watchdog. Select a document above and ask me anything about it!"
    }
  ]);

  useEffect(() => {
    fetch("/api/documents")
      .then(res => res.json())
      .then(data => {
        setDocuments(data);
        if (data.length > 0) {
          setSelectedDocId(data[0].id);
        }
      });
  }, []);

  const activeDoc = documents.find(d => d.id === selectedDocId) || null;

  const handleSend = async () => {
    if (!query.trim() || !activeDoc) return;
    
    const userMsg = query;
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setQuery("");
    setIsTyping(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
           query: userMsg,
           // Add simple reference to currently selected active document context
           context: JSON.stringify({ 
             title: activeDoc.title,
             summary: activeDoc.summary,
             allocations: activeDoc.totalBudget,
             departments: activeDoc.departments,
             locations: activeDoc.locations,
             fullContent: activeDoc.fullContent
           })
        })
      });
      const data = await res.json();
      if (!res.ok) {
         throw new Error(data.error || "Failed");
      }
      setMessages(prev => [...prev, { role: 'assistant', content: data.text }]);
    } catch (e: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I had trouble processing that request. Please try again later." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#F9FAFB]">
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-6 py-4 bg-white border-b border-gray-200 shrink-0 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#006633] rounded-lg flex items-center justify-center shrink-0">
            <Shield size={24} className="text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight tracking-tight text-[#111827]">County Budget Watchdog</h1>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">Kenya Civic Intelligence</p>
          </div>
        </div>
        
        <div className="flex-1 w-full sm:max-w-md">
          <select 
            value={selectedDocId}
            onChange={(e) => setSelectedDocId(e.target.value)}
            className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#006633] text-[#111827]">
            <option value="" disabled>Select a Document to Review...</option>
            {documents.map(doc => (
              <option key={doc.id} value={doc.id}>{doc.title} ({doc.county})</option>
            ))}
          </select>
        </div>
      </header>

      <main className="flex-1 overflow-auto flex flex-col lg:flex-row shadow-inner">
        {/* Left Side: Document Summary */}
        <div className="flex-1 p-6 lg:p-8 lg:border-r border-gray-200 lg:max-w-xl overflow-auto shrink-0 bg-white">
          {!activeDoc ? (
            <div className="h-full flex items-center justify-center text-gray-400">
               <p>Please select a document above to see details.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-[#111827]">{activeDoc.title}</h2>
                  <div className="text-sm text-gray-500 mt-1">Uploaded {new Date(activeDoc.uploadedAt).toLocaleDateString()}</div>
                </div>
                {activeDoc.pdfUrl && (
                  <Button variant="outline" size="sm" onClick={() => setViewingPdfUrl(activeDoc.pdfUrl)}>View Original PDF</Button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Card className="rounded-xl border-gray-100 shadow-sm border-t-4 border-t-[#006633]">
                  <CardContent className="pt-4">
                    <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">Total Budget</p>
                    <h3 className="text-xl font-bold text-[#111827] mt-1 tracking-tight">{activeDoc.totalBudget !== "N/A" ? activeDoc.totalBudget : "Various"}</h3>
                  </CardContent>
                </Card>
                <Card className="rounded-xl border-gray-100 shadow-sm border-t-4 border-t-blue-500">
                  <CardContent className="pt-4">
                    <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">Fiscal Year</p>
                    <h3 className="text-xl font-bold text-[#111827] mt-1 tracking-tight">{activeDoc.fiscalYear}</h3>
                  </CardContent>
                </Card>
              </div>

              <Card className="rounded-xl border-gray-100 shadow-sm bg-gray-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-bold text-[#111827]">Document Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {activeDoc.summary || "No summary available."}
                  </p>
                </CardContent>
              </Card>

              {activeDoc.locations && activeDoc.locations.length > 0 && (
                <Card className="rounded-xl border-gray-100 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-bold text-[#111827]">Local Impacts</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {activeDoc.locations.slice(0, 5).map((loc: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-start text-sm border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                        <div>
                          <div className="font-semibold text-gray-800">{loc.name}</div>
                          <div className="text-xs text-gray-500">{loc.impact}</div>
                        </div>
                        {loc.allocation && loc.allocation !== "N/A" && (
                          <div className="text-[#006633] font-mono text-xs font-bold pt-1">{loc.allocation}</div>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>

        {/* Right Side: Chat Interface */}
        <div className="flex-1 flex flex-col bg-[#F9FAFB] min-h-[500px]">
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
            <div className="w-full space-y-6 max-w-3xl mx-auto">
              {messages.map((m, i) => (
                <div key={i} className={`flex gap-4 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {m.role === 'assistant' && (
                    <div className="w-8 h-8 rounded bg-[#006633] flex-shrink-0 flex items-center justify-center text-[10px] text-white font-bold mt-1">
                      AI
                    </div>
                  )}
                  <Card className={`max-w-[85%] border-none shadow-sm ${m.role === 'user' ? 'bg-[#006633] text-white rounded-br-none' : 'bg-white rounded-tl-none border border-gray-100'}`}>
                    <CardContent className="p-3 md:p-4">
                      <div className={`prose prose-sm max-w-none ${m.role === 'user' ? 'text-white' : 'text-gray-700'}`}>
                         <Markdown>{m.content}</Markdown>
                      </div>
                    </CardContent>
                  </Card>
                  {m.role === 'user' && (
                    <div className="w-8 h-8 rounded bg-gray-200 flex-shrink-0 mt-1"></div>
                  )}
                </div>
              ))}
              {isTyping && (
                 <div className="flex gap-4 justify-start">
                   <div className="w-8 h-8 rounded bg-[#006633] flex-shrink-0 flex items-center justify-center text-[10px] text-white font-bold">
                      AI
                   </div>
                   <Card className="bg-white border border-gray-100 shadow-sm rounded-2xl w-24 rounded-tl-none">
                     <CardContent className="p-4 flex justify-center items-center space-x-2">
                        <div className="w-2 h-2 bg-[#006633] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-[#006633] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-[#006633] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                     </CardContent>
                   </Card>
                 </div>
              )}
            </div>
          </div>

          <div className="bg-white border-t border-gray-200 p-4 shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <div className="max-w-3xl mx-auto flex space-x-2 relative">
               <Input 
                 className="flex-1 py-6 pr-14 text-sm rounded-xl bg-gray-100 border-none shadow-sm focus-visible:ring-[#006633]" 
                 placeholder="Ask a question about the selected document..." 
                 onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                 value={query}
                 onChange={e => setQuery(e.target.value)}
                 disabled={!activeDoc}
               />
               <Button onClick={handleSend} disabled={!activeDoc} size="icon" className="absolute right-2 top-1.5 h-10 w-10 bg-[#006633] hover:bg-[#005522] rounded-lg">
                 <Send size={18} className="text-white" />
               </Button>
            </div>
            <div className="max-w-3xl mx-auto mt-2 flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
               <Button variant="outline" size="sm" onClick={() => setQuery("Can you summarize the main impacts of this document?")} className="text-xs bg-gray-50 text-gray-600 border-gray-200 rounded-full whitespace-nowrap hover:bg-gray-100 text-left">
                  Summarize main impacts
               </Button>
               <Button variant="outline" size="sm" onClick={() => setQuery("How much is allocated to local projects?")} className="text-xs bg-gray-50 text-gray-600 border-gray-200 rounded-full whitespace-nowrap hover:bg-gray-100 text-left">
                  Local allocations?
               </Button>
            </div>
          </div>
        </div>
      </main>

      {/* PDF Viewer Dialog */}
      {viewingPdfUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50 shrink-0">
               <h3 className="font-bold text-lg text-gray-900">Original Document</h3>
               <Button variant="ghost" size="sm" onClick={() => setViewingPdfUrl(null)} className="h-8 w-8 p-0 rounded-full hover:bg-gray-200 text-gray-500">
                 &times;
               </Button>
            </div>
            <div className="flex-1 bg-gray-100 relative">
               <iframe src={viewingPdfUrl} className="absolute inset-0 w-full h-full border-0" title="PDF Viewer" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
