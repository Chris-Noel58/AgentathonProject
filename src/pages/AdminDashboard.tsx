import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, FileText, CheckCircle, Save, Smartphone, Database } from "lucide-react";

export default function AdminDashboard() {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [smsUpdate, setSmsUpdate] = useState("");
  const [smsResult, setSmsResult] = useState<string[]>([]);
  const [generatingSms, setGeneratingSms] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);
  const [viewingDoc, setViewingDoc] = useState<any | null>(null);
  const [viewingPdfUrl, setViewingPdfUrl] = useState<string | null>(null);

  const fetchDocuments = async () => {
    try {
      const res = await fetch("/api/documents");
      const data = await res.json();
      setDocuments(data);
    } catch (e) {
      console.error("Failed to fetch documents", e);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleUpload = async () => {
    if (!file) return;
    setProcessing(true);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/process-doc", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setResult(JSON.stringify(data, null, 2));
      fetchDocuments(); // Refresh documents after upload
    } catch (e) {
      setResult("Error processing document");
    } finally {
      setProcessing(false);
    }
  };

  const handleGenerateSMS = async () => {
    if (!smsUpdate) return;
    setGeneratingSms(true);
    try {
      const res = await fetch("/api/generate-sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updateText: smsUpdate }),
      });
      const data = await res.json();
      setSmsResult(data.messages);
    } catch (e) {
      console.error(e);
    } finally {
      setGeneratingSms(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-[#111827]">Admin Control Center</h1>
        <p className="text-gray-500">Manage bills, budget sources, verify extraction, and broadcast SMS digests.</p>
      </div>

      <Tabs defaultValue="extraction" className="space-y-6">
        <TabsList className="bg-gray-100 text-gray-600 p-1 rounded-xl shadow-sm inline-flex">
          <TabsTrigger value="extraction" className="rounded-lg px-6 data-[state=active]:bg-white data-[state=active]:text-[#111827] data-[state=active]:shadow-sm">PDF Extraction</TabsTrigger>
          <TabsTrigger value="documents" className="rounded-lg px-6 data-[state=active]:bg-white data-[state=active]:text-[#111827] data-[state=active]:shadow-sm">Saved Documents</TabsTrigger>
          <TabsTrigger value="sms" className="rounded-lg px-6 data-[state=active]:bg-white data-[state=active]:text-[#111827] data-[state=active]:shadow-sm">SMS Broadcasts</TabsTrigger>
        </TabsList>

        <TabsContent value="extraction" className="space-y-6">
          <Card className="border-gray-200 border-2 border-dashed shadow-none bg-gray-50 rounded-2xl">
            <CardContent className="p-12 flex flex-col items-center justify-center text-center">
               <div className="bg-[#006633] bg-opacity-10 text-[#006633] p-4 rounded-full mb-4">
                  <Upload size={32} />
               </div>
               <h3 className="text-lg font-semibold text-[#111827] mb-2">Upload Bill or Budget PDF</h3>
               <p className="text-gray-500 text-sm mb-6 max-w-md">Gemini Document Extraction will parse the PDF, extract details, impacts, and map them to counties and wards.</p>
               
               <Input 
                 type="file" 
                 accept="application/pdf"
                 onChange={(e) => setFile(e.target.files?.[0] || null)}
                 className="max-w-xs mb-4 bg-white"
               />
               <Button 
                  onClick={handleUpload} 
                  disabled={!file || processing}
                  className="bg-[#006633] text-white hover:bg-[#005522]"
               >
                 {processing ? "Processing via Gemini..." : "Extract Data"}
               </Button>
            </CardContent>
          </Card>

          {result && (
            <Card className="border shadow-sm border-green-200 rounded-2xl">
               <CardHeader className="bg-green-50 border-b border-green-100 flex flex-row items-center justify-between py-4 rounded-t-2xl">
                 <CardTitle className="text-green-800 text-lg flex items-center gap-2">
                   <CheckCircle size={20} className="text-green-500" /> Successfully Added to Database
                 </CardTitle>
               </CardHeader>
               <CardContent className="p-0">
                  <pre className="bg-[#111827] text-green-400 p-6 overflow-auto max-h-[400px] font-mono text-sm rounded-b-2xl">
                    {result}
                  </pre>
               </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
           <Card className="shadow-sm border-gray-100 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg text-[#111827] flex items-center gap-2"><Database size={20} className="text-[#006633]" /> Database Records</CardTitle>
              </CardHeader>
              <CardContent>
                 {documents.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                       {documents.map((doc) => (
                          <div key={doc.id} className="border border-gray-100 bg-gray-50 p-4 rounded-xl shadow-sm">
                             <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold text-sm text-gray-900 line-clamp-1" title={doc.title}>{doc.title}</h4>
                                <span className="text-[10px] bg-green-100 text-green-800 px-2 py-0.5 rounded uppercase font-semibold shrink-0">{doc.documentType}</span>
                             </div>
                             <p className="text-xs text-gray-600 mb-3 line-clamp-2">{doc.summary}</p>
                             <div className="flex justify-between items-center text-xs text-gray-500">
                                <span>{doc.county}</span>
                                <span>{doc.fiscalYear}</span>
                             </div>
                             <div className="mt-3 text-xs bg-white p-2 rounded border border-gray-100 flex items-center justify-between font-mono">
                                <span>{doc.totalBudget}</span>
                                <div className="flex gap-2">
                                  <Button variant="outline" size="sm" className="h-6 text-[10px] px-2" onClick={() => setViewingDoc(doc)}>View Data</Button>
                                  {doc.pdfUrl && (
                                    <Button variant="outline" size="sm" className="h-6 text-[10px] px-2" onClick={() => setViewingPdfUrl(doc.pdfUrl)}>View PDF</Button>
                                  )}
                                </div>
                             </div>
                          </div>
                       ))}
                    </div>
                 ) : (
                    <div className="h-full flex items-center justify-center p-8 text-gray-400 border border-dashed rounded-2xl border-gray-200 bg-white">
                        <p className="text-center text-sm">No documents found.<br/>Upload and extract above to populate.</p>
                    </div>
                 )}
              </CardContent>
           </Card>
        </TabsContent>

        <TabsContent value="sms" className="grid md:grid-cols-2 gap-6">
           <Card className="shadow-sm border-gray-100 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg text-[#111827]">Draft Budget Change</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                   <label className="text-sm font-medium text-gray-700 mb-1 block">Input complex budget change:</label>
                   <Textarea 
                     rows={5} 
                     placeholder="e.g. Allocation to Kilimani ward for the Lenana road drainage has been reduced by 10 million in the recent supplementary budget review. The funds have been diverted to administrative costs in the governor's office."
                     value={smsUpdate}
                     onChange={(e) => setSmsUpdate(e.target.value)}
                     className="resize-none"
                   />
                </div>
                <Button 
                   onClick={handleGenerateSMS} 
                   disabled={!smsUpdate || generatingSms}
                   className="w-full bg-[#111827] text-white hover:bg-gray-800"
                >
                   {generatingSms ? "Generating Digest..." : "Generate SMS Digest"}
                </Button>
              </CardContent>
           </Card>

           <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2 text-[#111827]"><Smartphone size={20} /> Preview & Approve</h3>
              {smsResult.length > 0 ? (
                smsResult.map((msg, i) => (
                  <Card key={i} className="border shadow-sm bg-gray-50 rounded-2xl border-gray-100">
                    <CardContent className="p-4 relative">
                       <p className="text-gray-800 font-medium font-sans mb-3 pr-16">{msg}</p>
                       <div className="flex justify-between items-center text-xs text-gray-500 border-t border-gray-200 pt-3 mt-2">
                          <span className="bg-white px-2 py-1 rounded border border-gray-200 shadow-sm">
                            {i === 0 ? "Formal" : i === 1 ? "Simple English" : "Swahili"}
                          </span>
                          <span>{msg.length} / 160 chars</span>
                       </div>
                       <Button size="sm" className="absolute top-4 right-4 h-8 w-14 bg-[#006633] hover:bg-[#005522] text-white"><Save size={14}/></Button>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="h-full flex items-center justify-center p-8 text-gray-400 border border-dashed rounded-2xl border-gray-200 bg-white">
                   <p className="text-center text-sm">Enter a budget update<br/>to generate SMS digests.</p>
                </div>
              )}
           </div>
        </TabsContent>
      </Tabs>

      {viewingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50 shrink-0">
              <h3 className="font-bold text-lg text-gray-900">{viewingDoc.title}</h3>
              <Button variant="ghost" size="sm" onClick={() => setViewingDoc(null)} className="h-8 w-8 p-0 rounded-full hover:bg-gray-200">
                &times;
              </Button>
            </div>
            <div className="p-6 overflow-y-auto bg-[#111827]">
              <pre className="text-green-400 font-mono text-sm whitespace-pre-wrap">
                {JSON.stringify(viewingDoc, null, 2)}
              </pre>
            </div>
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-2 shrink-0">
              {viewingDoc.pdfUrl && (
                <Button variant="outline" onClick={() => { setViewingDoc(null); setViewingPdfUrl(viewingDoc.pdfUrl); }}>View Original PDF</Button>
              )}
              <Button onClick={() => setViewingDoc(null)} className="bg-[#006633] text-white hover:bg-[#005522]">Close</Button>
            </div>
          </div>
        </div>
      )}

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
  )
}
