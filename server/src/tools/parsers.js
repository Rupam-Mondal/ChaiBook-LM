import os from "os";
import { randomUUID } from "crypto";
import fs from "fs/promises";
import axios from "axios";
import { PDFParse } from "pdf-parse";
import path from "path";
import mammoth from "mammoth";
import pptx2json from "pptx2json";
import webvtt from "node-webvtt";
import parseSRT from "parse-srt";
import { YoutubeTranscript } from "youtube-transcript";

function formatTime(seconds) {
  const totalSeconds = Math.floor(seconds);

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  return [hours, minutes, secs]
    .map((v) => String(v).padStart(2, "0"))
    .join(":");
}

export async function YTParser(url) {
  try {
    const transcript = await YoutubeTranscript.fetchTranscript(url);

    if (!transcript || transcript.length === 0) {
      throw new Error("Transcript not available for this video.");
    }

    const subtitles = transcript.map((item) => {
      const start = item.offset / 1000;
      const duration = item.duration / 1000;

      return {
        start: formatTime(start),
        end: formatTime(start + duration),
        text: item.text.trim(),
      };
    });

    return {
      title: "YouTube Video",
      type: "youtube",
      url,
      content: subtitles.map((subtitle) => subtitle.text).join(" "),
      subtitles,
    };
  } catch (error) {
    throw new Error(`YT Parser: ${error.message}`);
  }
}


export async function TXTParser(filePath) {
  try {
    const content = await fs.readFile(filePath, "utf8");
    return {
      title: filePath.split(/[\\/]/).pop(),
      type: "txt",
      content,
    };
  } catch (error) {
    throw error;
  }
}

export async function VTTParser(filePath) {
  try {
    const content = await fs.readFile(filePath, "utf8");
    console.log("content");
    console.log(typeof content);
    console.log(content.slice(0, 200));
    const result = webvtt.parse(content);
    const subtitles = result.cues.map((cue) => ({
      start: cue.start,
      end: cue.end,
      text: cue.text,
    }));

    console.log(subtitles);
    return {
      title: path.basename(filePath),
      type: ".vtt",
      content,
      subtitles,
    };
  } catch (error) {
    console.error(err);
    console.error(err.stack);
    throw error;
  }
}

export async function SRTParser(filePath) {
  try {
    const content = await fs.readFile(filePath, "utf8");

    const subtitles = parseSRT(content).map((cue) => ({
      start: cue.start,
      end: cue.end,
      text: cue.text.replace(/\r?\n/g, " "),
    }));

    const textContent = subtitles
      .map((s) => `[${s.start}-${s.end}] ${s.text}`)
      .join("\n");

    return {
      title: path.basename(filePath),
      type: ".srt",
      content: textContent,
      subtitles,
    };
  } catch (error) {
    throw error;
  }
}

export async function PDFParser(filePath) {
  try {
    const buffer = await fs.readFile(filePath);

    const parser = new PDFParse({
      data: buffer,
    });

    const result = await parser.getText();

    await parser.destroy();

    return {
      title: path.basename(filePath),
      type: ".pdf",
      content: result.text.trim(),
    };
  } catch (error) {
    throw error;
  }
}

export async function DOCXParser(filePath) {
  try {
    const buffer = await fs.readFile(filePath);

    const result = await mammoth.extractRawText({
      buffer,
    });

    return {
      title: path.basename(filePath),
      type: ".docx",
      content: result.value.trim(),
    };
  } catch (error) {
    throw error;
  }
}

export async function PPTXParser(filePath) {
  try {
    const presentation = await pptx2json(filePath);

    let text = "";

    for (const slide of presentation.slides) {
      for (const shape of slide.shapes) {
        if (shape.text) {
          text += shape.text + "\n";
        }
      }
    }

    return {
      title: path.basename(filePath),
      type: ".pptx",
      content: text.trim(),
    };
  } catch (error) {
    throw error;
  }
}

export async function PDFURLParser(filePath){
  try {
    let tempFilePath = path.join(os.tmpdir(), `${randomUUID()}.pdf`);

    const response = await axios.get(filePath , {
      responseType:"arraybuffer"
    })

    await fs.writeFile(tempFilePath, response.data);
    const parsedPDF = await PDFParser(tempFilePath);

    return parsedPDF;

  } catch (error) {
    throw error;
  }
}


