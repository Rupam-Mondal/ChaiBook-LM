import { sourceIdentifier } from "../tools/bodyIdentifier.js";
import { chunkDocuments } from "../tools/chukingTool.js";
import { generateVectorEmbeddings } from "../tools/filesQdruntUploader.js";
import { DOCXParser, PDFParser, PDFURLParser, PPTXParser,SRTParser,TXTParser,VTTParser, YTParser } from "../tools/parsers.js";
import { websiteParser } from "../tools/websiteParser.js";

export async function documentUploadService(data){
    try {
        const sources = await sourceIdentifier(data);
        console.log(sources);
        const parsedDocuments = [];
        for(const source of sources){
            if(source.sourceType === "youtube"){
                console.log("YouTube Processor");
                const YTresult = await YTParser(data.source);
                const chunkYT = await chunkDocuments([YTresult]);
                const embeddingsYT = await generateVectorEmbeddings(chunkYT);
                parsedDocuments.push(embeddingsYT);
            }
            else if (source.sourceType === "website"){
                console.log("Website Processor");
                const Websiteresult = await websiteParser(data.source);
                const chunkWebsite = await chunkDocuments([Websiteresult]);
                const embeddingsWebsite = await generateVectorEmbeddings(chunkWebsite);
                parsedDocuments.push(embeddingsWebsite);
            }
            else if (source.sourceType === "github") {
                console.log("GitHub Processor");
            }
            else if (source.sourceType === "pdf-url") {
                console.log("Remote PDF Processor");
                const PDFURLresult = await PDFURLParser(data.source);
                const chunkURLPDF = await chunkDocuments([PDFURLresult]);
                const embeddingsURLPDF = await generateVectorEmbeddings(chunkURLPDF);

                parsedDocuments.push(embeddingsURLPDF);

            }
            else if(source.sourceType === "file"){
                switch (source.extension) {
                    case ".pdf":
                        console.log("PDF Parser");
                        const PDFresult = await PDFParser(source.path);
                        const chunkPDf = await chunkDocuments([PDFresult]);
                        const embeddingsPDF = await generateVectorEmbeddings(chunkPDf);
                        parsedDocuments.push(embeddingsPDF);
                        break;

                    case ".docx":
                        console.log("DOCX Parser");
                        const DOCXresult = await DOCXParser(source.path);
                        const chunkDOCX = await chunkDocuments([DOCXresult]);
                        const embeddingsDOCX = await generateVectorEmbeddings(chunkDOCX);
                        parsedDocuments.push(embeddingsDOCX)
                        break;

                    case ".pptx":
                        console.log("PPTX Parser");
                        const PPTXresult = await PPTXParser(source.path);
                        const chunkPPTX = await chunkDocuments([PPTXresult]);
                        const embeddingsPPTX = await generateVectorEmbeddings(chunkPPTX);
                        parsedDocuments.push(embeddingsPPTX);
                        break;

                    case ".vtt":
                        console.log("VTT Parser");
                        const VTTresult = await VTTParser(source.path);
                        const chunkVTT = await chunkDocuments([VTTresult]);
                        const embeddingVTT = await generateVectorEmbeddings(chunkVTT);
                        parsedDocuments.push(embeddingVTT);
                        break;
                    
                    case ".txt":
                        console.log("TXT Parser");
                        const TXTresult = await TXTParser(source.path);
                        const chunkTXT = await chunkDocuments([TXTresult]);
                        const embeddingsTXT = await generateVectorEmbeddings(chunkTXT);
                        parsedDocuments.push(embeddingsTXT);
                        break;

                    case ".srt":
                        console.log("SRT Parser");
                        const SRTresult = await SRTParser(source.path);
                        const chunkSRT = await chunkDocuments([SRTresult]);
                        const embeddingsSRT = await generateVectorEmbeddings(chunkSRT)
                        parsedDocuments.push(embeddingsSRT);
                        break;

                    case ".zip":
                        console.log("ZIP Parser");
                        break;

                    default:
                        throw new Error(`Unsupported file: ${source.fileName}`);
                }
            }
        }

        return parsedDocuments;

    } catch (error) {
        throw error;
    }
}