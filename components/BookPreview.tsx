import React, { useState, useRef, useEffect } from 'react';
import { EBook } from '../types';
import { marked } from 'marked';
import ReactMarkdown from 'react-markdown';
import JSZip from 'jszip';
import { editContentWithAI } from '../services/geminiService';
import { 
  ArrowDownTrayIcon, 
  PrinterIcon, 
  DocumentTextIcon, 
  CodeBracketIcon,
  PencilSquareIcon,
  XMarkIcon,
  CheckIcon,
  PhotoIcon,
  LinkIcon,
  ArrowPathIcon,
  BookOpenIcon,
  SparklesIcon,
  CheckBadgeIcon,
  ArrowsRightLeftIcon,
  SpeakerWaveIcon,
  BoldIcon,
  ItalicIcon,
  PaintBrushIcon,
  Bars3BottomLeftIcon, // Align Left
  Bars3Icon, // Align Center (used as proxy)
  Bars3BottomRightIcon, // Align Right
  FaceSmileIcon,
  SwatchIcon
} from '@heroicons/react/24/solid';

interface BookPreviewProps {
  ebook: EBook;
  apiKey: string;
  onRestart: () => void;
  onUpdateChapter: (index: number, content: string) => void;
}

const COMMON_EMOJIS = [
  "😊", "😂", "🥰", "😎", "🤔", "💡", "✅", "❌", "🔥", "✨", 
  "🚀", "💰", "📈", "📚", "🖊️", "⭐", "❤️", "👍", "👎", "🎉",
  "👋", "🤝", "👀", "🧠", "🎯", "🏆", "📢", "🔔", "🗓️", "📍"
];

const FONT_OPTIONS = [
  { label: 'ค่าเริ่มต้น (Prompt)', value: '' },
  { label: 'Sarabun (เนื้อหา)', value: 'Sarabun' },
  { label: 'Serif (ทางการ)', value: 'ui-serif, Georgia, serif' },
  { label: 'Monospace (โค้ด)', value: 'ui-monospace, SFMono-Regular, monospace' },
];

export const BookPreview: React.FC<BookPreviewProps> = ({ ebook, apiKey, onRestart, onUpdateChapter }) => {
  const [activeChapter, setActiveChapter] = useState(0);
  const [isExportingEPUB, setIsExportingEPUB] = useState(false);
  
  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editingContent, setEditingContent] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  
  // Formatting State
  const [textColor, setTextColor] = useState('#000000');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showFontPicker, setShowFontPicker] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startEditing = (index: number, content: string) => {
    setEditingIndex(index);
    setEditingContent(content || "");
    setIsEditing(true);
  };

  const saveEditing = () => {
    if (editingIndex !== null) {
      onUpdateChapter(editingIndex, editingContent);
    }
    setIsEditing(false);
    setEditingIndex(null);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditingIndex(null);
  };

  // --- Formatting Helpers ---

  const insertTextAtCursor = (textToInsert: string, selectionOffset = 0) => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = editingContent;
    
    const newText = text.substring(0, start) + textToInsert + text.substring(end);
    setEditingContent(newText);
    
    // Restore cursor position
    setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + selectionOffset, start + selectionOffset);
    }, 0);
  };

  const wrapSelection = (prefix: string, suffix: string) => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = editingContent;
    
    const selectedText = text.substring(start, end);
    const newText = text.substring(0, start) + prefix + selectedText + suffix + text.substring(end);
    
    setEditingContent(newText);
    
    setTimeout(() => {
        textarea.focus();
        // If nothing selected, place cursor in between tags
        if (start === end) {
             textarea.setSelectionRange(start + prefix.length, start + prefix.length);
        } else {
             textarea.setSelectionRange(start, end + prefix.length + suffix.length);
        }
    }, 0);
  };

  const applyHeading = (level: number) => {
      const hashes = '#'.repeat(level) + ' ';
      // Simple logic: insert at start of selection, assuming user selects a line
      insertTextAtCursor(hashes); 
  };

  const applyColor = (color: string) => {
      wrapSelection(`<span style="color: ${color}">`, `</span>`);
  };

  const applyFont = (fontFamily: string) => {
      if (!fontFamily) return;
      wrapSelection(`<span style="font-family: ${fontFamily}">`, `</span>`);
      setShowFontPicker(false);
  };

  const applyAlignment = (align: 'left' | 'center' | 'right') => {
      if (align === 'left') {
          // Default, just remove wrapper if we had logic for it, but here we just wrap for center/right
          return; 
      }
      wrapSelection(`<div style="text-align: ${align}">\n`, `\n</div>`);
  };

  // --- End Formatting Helpers ---

  const handleInsertImage = (url: string, alt: string = 'รูปภาพประกอบ') => {
      insertTextAtCursor(`\n\n![${alt}](${url})\n\n`);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
              if (event.target?.result) {
                  handleInsertImage(event.target.result as string, file.name);
              }
          };
          reader.readAsDataURL(file);
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAiEdit = async (mode: 'grammar' | 'rephrase' | 'tone') => {
    if (!textareaRef.current) return;
    
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const fullText = editingContent;
    
    const selectedText = fullText.substring(start, end);
    const hasSelection = start !== end;
    
    const textToProcess = hasSelection ? selectedText : fullText;
    
    if (!textToProcess.trim()) return;

    setIsAiProcessing(true);
    
    let instruction = "";
    switch (mode) {
        case 'grammar': instruction = "Correct grammar, spelling, and punctuation errors. Ensure sentence structure is grammatically sound."; break;
        case 'rephrase': instruction = "Rephrase this text for better clarity, flow, and readability. Make it easier to understand."; break;
        case 'tone': instruction = `Rewrite this text to strictly match the requested tone: "${ebook.tone || 'Professional'}". Ensure consistency in style.`; break;
    }

    try {
        const result = await editContentWithAI(apiKey, textToProcess, instruction, {
            tone: ebook.tone,
            audience: ebook.targetAudience
        });

        if (result) {
            if (hasSelection) {
                const newText = fullText.substring(0, start) + result + fullText.substring(end);
                setEditingContent(newText);
            } else {
                setEditingContent(result);
            }
        }
    } catch (error) {
        console.error("AI Edit error", error);
        alert("ขออภัย AI ไม่สามารถประมวลผลได้ในขณะนี้ กรุณาตรวจสอบ API Key หรือโควต้าการใช้งาน");
    } finally {
        setIsAiProcessing(false);
    }
  };

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getFullHTML = async () => {
    let bodyContent = '';
    
    if (ebook.coverImage) {
        bodyContent += `<div style="text-align:center; margin-bottom: 60px;"><img src="${ebook.coverImage}" style="max-width:100%; height:auto; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.15);"></div>`;
    }
    bodyContent += `<h1 style="text-align:center; font-size: 3.5em; margin-bottom: 0.5em; color: #44403c; font-family: 'Prompt', sans-serif;">${ebook.title}</h1>`;
    bodyContent += `<p style="text-align:center; font-size: 1.2em; color: #78716c; margin-bottom: 3em;">${ebook.targetAudience}</p>`;
    bodyContent += `<div style="text-align:center; font-style: italic; margin-bottom: 6em; padding: 40px; background: #faf5ff; border-radius: 16px; border: 1px solid #e9d5ff;">${ebook.description}</div>`;
    
    for (const chap of ebook.chapters) {
        bodyContent += `<div style="page-break-after: always; margin-bottom: 80px;">`;
        bodyContent += `<h2 style="font-size: 2.2em; border-bottom: 3px solid #9333ea; padding-bottom: 15px; margin-bottom: 30px; color: #581c87; font-family: 'Prompt', sans-serif;">${chap.title}</h2>`;
        const htmlContent = await marked.parse(chap.content || '');
        bodyContent += `<div style="font-size: 1em; line-height: 1.9; color: #292524;">${htmlContent}</div>`;
        bodyContent += `</div>`;
    }

    return `
      <!DOCTYPE html>
      <html lang="th">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${ebook.title}</title>
          <link href="https://fonts.googleapis.com/css2?family=Prompt:wght@400;700&family=Sarabun:wght@300;400;600&display=swap" rel="stylesheet">
          <style>
              body { font-family: 'Sarabun', sans-serif; max-width: 800px; margin: 0 auto; padding: 60px; background-color: #ffffff; font-size: 16px; }
              img { max-width: 100%; height: auto; display: block; margin: 30px auto; border-radius: 8px; }
              h1, h2, h3 { font-family: 'Prompt', sans-serif; font-weight: 700; }
              p { margin-bottom: 1.6em; }
              ul, ol { margin-bottom: 1.6em; padding-left: 24px; }
              li { margin-bottom: 0.8em; }
              blockquote { border-left: 5px solid #d8b4fe; padding-left: 20px; color: #6b21a8; font-style: italic; background: #faf5ff; padding: 15px 20px; border-radius: 0 8px 8px 0; }
              /* Utility classes support for printing */
              .text-center { text-align: center; }
              .text-right { text-align: right; }
              @media print {
                  body { max-width: 100%; padding: 0; }
              }
          </style>
      </head>
      <body>
          ${bodyContent}
      </body>
      </html>
    `;
  };

  const handleDownloadMarkdown = () => {
    let mdContent = `# ${ebook.title}\n\n`;
    mdContent += `> ${ebook.description}\n\n`;
    mdContent += `**กลุ่มเป้าหมาย:** ${ebook.targetAudience}\n\n`;
    mdContent += `---\n\n`;
    
    ebook.chapters.forEach(chap => {
        mdContent += `# ${chap.title}\n\n`;
        mdContent += `${chap.content}\n\n`;
        mdContent += `---\n\n`;
    });
    
    downloadFile(mdContent, `${ebook.title}.md`, 'text/markdown');
  };

  const handleDownloadHTML = async () => {
    const html = await getFullHTML();
    downloadFile(html, `${ebook.title}.html`, 'text/html');
  };

  const handleDownloadEPUB = async () => {
    setIsExportingEPUB(true);
    try {
        const zip = new JSZip();

        // 1. mimetype
        zip.file("mimetype", "application/epub+zip");

        // 2. META-INF/container.xml
        zip.folder("META-INF")?.file("container.xml", `<?xml version="1.0"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
   <rootfiles>
      <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
   </rootfiles>
</container>`);

        // 3. OEBPS folder
        const oebps = zip.folder("OEBPS");
        if(!oebps) return;

        // CSS
        oebps.file("style.css", `
            body { font-family: 'Sarabun', sans-serif; line-height: 1.6; color: #333; font-size: 16px; }
            h1, h2, h3 { color: #7e22ce; margin-top: 1em; margin-bottom: 0.5em; font-family: 'Prompt', sans-serif; }
            img { max-width: 100%; height: auto; display: block; margin: 1em auto; }
            blockquote { border-left: 4px solid #a855f7; padding-left: 1em; color: #6b21a8; font-style: italic; margin: 1em 0; }
            p { margin-bottom: 1em; }
        `);

        let manifest = '';
        let spine = '';
        let navMap = '';

        // Title Page
        const titlePageContent = `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head><title>${ebook.title}</title><link rel="stylesheet" type="text/css" href="style.css"/></head>
<body>
  <div style="text-align:center; margin-top: 50px;">
    ${ebook.coverImage ? `<img src="cover.jpg" alt="Cover" style="max-height: 800px;"/>` : ''}
    <h1>${ebook.title}</h1>
    <p>${ebook.targetAudience}</p>
    <p><i>${ebook.description}</i></p>
  </div>
</body>
</html>`;
        oebps.file("title.xhtml", titlePageContent);
        manifest += `<item id="title" href="title.xhtml" media-type="application/xhtml+xml"/>\n`;
        spine += `<itemref idref="title"/>\n`;
        navMap += `<navPoint id="navPoint-0" playOrder="0"><navLabel><text>Title Page</text></navLabel><content src="title.xhtml"/></navPoint>\n`;

        // Cover Image
        if (ebook.coverImage) {
            try {
                const response = await fetch(ebook.coverImage);
                const blob = await response.blob();
                oebps.file("cover.jpg", blob);
                manifest += `<item id="cover-img" href="cover.jpg" media-type="image/jpeg"/>\n`;
            } catch (e) {
                console.warn("Could not fetch cover image for EPUB", e);
            }
        }

        // Chapters
        for (let i = 0; i < ebook.chapters.length; i++) {
            const chap = ebook.chapters[i];
            const htmlContent = await marked.parse(chap.content || '');
            const filename = `chapter-${i+1}.xhtml`;
            const fileContent = `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head><title>${chap.title}</title><link rel="stylesheet" type="text/css" href="style.css"/></head>
<body>
  <h2>${chap.title}</h2>
  <div>${htmlContent}</div>
</body>
</html>`;
            oebps.file(filename, fileContent);
            
            const id = `chap${i+1}`;
            manifest += `<item id="${id}" href="${filename}" media-type="application/xhtml+xml"/>\n`;
            spine += `<itemref idref="${id}"/>\n`;
            navMap += `<navPoint id="navPoint-${i+1}" playOrder="${i+1}"><navLabel><text>${chap.title}</text></navLabel><content src="${filename}"/></navPoint>\n`;
        }

        // toc.ncx
        oebps.file("toc.ncx", `<?xml version="1.0" encoding="UTF-8"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
<head><meta name="dtb:uid" content="urn:uuid:12345"/></head>
<docTitle><text>${ebook.title}</text></docTitle>
<navMap>
  ${navMap}
</navMap>
</ncx>`);

        // content.opf
        oebps.file("content.opf", `<?xml version="1.0" encoding="utf-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="BookId" version="2.0">
    <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
        <dc:title>${ebook.title}</dc:title>
        <dc:language>th</dc:language>
        <dc:identifier id="BookId">urn:uuid:12345</dc:identifier>
        <meta name="cover" content="cover-img"/>
    </metadata>
    <manifest>
        <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>
        <item id="css" href="style.css" media-type="text/css"/>
        ${manifest}
    </manifest>
    <spine toc="ncx">
        ${spine}
    </spine>
</package>`);

        const content = await zip.generateAsync({type: "blob"});
        const url = URL.createObjectURL(content);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${ebook.title}.epub`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

    } catch (e) {
        console.error("EPUB Generation Error", e);
        alert("ไม่สามารถสร้างไฟล์ EPUB ได้ในขณะนี้");
    } finally {
        setIsExportingEPUB(false);
    }
  };

  const handlePrintPDF = async () => {
    const html = await getFullHTML();
    const printWindow = window.open('', '_blank');
    if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
        }, 500);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-full relative animate-fade-in">
      
      {/* Edit Modal Overlay */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-md">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col border border-stone-200 overflow-hidden relative">
            
            {/* AI Processing Overlay */}
            {isAiProcessing && (
                <div className="absolute inset-0 z-50 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center">
                    <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin mb-4"></div>
                    <span className="text-purple-700 font-bold animate-pulse">AI กำลังปรับปรุงเนื้อหา...</span>
                </div>
            )}

            <div className="p-4 border-b border-stone-100 flex justify-between items-center bg-purple-50">
              <h3 className="font-bold text-stone-800 flex items-center gap-2">
                <PencilSquareIcon className="w-5 h-5 text-purple-600" /> 
                แก้ไขเนื้อหา: {editingIndex !== null && ebook.chapters[editingIndex]?.title}
              </h3>
              <button onClick={cancelEditing} className="text-stone-400 hover:text-stone-600 transition-colors bg-white p-1 rounded-full border border-stone-200 hover:bg-stone-100">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            
            {/* Rich Text Toolbar */}
            <div className="bg-white border-b border-stone-200 px-4 py-3 flex items-center gap-3 flex-wrap shadow-sm z-10">
                
                {/* 1. Headings */}
                <div className="flex items-center bg-stone-100 rounded-lg p-1 border border-stone-200">
                    <select 
                        onChange={(e) => applyHeading(Number(e.target.value))}
                        className="bg-transparent text-xs font-bold text-stone-700 px-2 py-1 outline-none cursor-pointer hover:text-purple-700"
                        defaultValue=""
                    >
                        <option value="" disabled>ข้อความ</option>
                        <option value="1">H1 หัวข้อใหญ่</option>
                        <option value="2">H2 หัวข้อรอง</option>
                        <option value="3">H3 หัวข้อย่อย</option>
                    </select>
                </div>

                {/* 2. Text Style */}
                <div className="flex items-center bg-stone-100 rounded-lg p-1 border border-stone-200 gap-1">
                    <button onClick={() => wrapSelection('**', '**')} className="p-1.5 hover:bg-white rounded-md text-stone-600 hover:text-black transition-all" title="ตัวหนา">
                        <BoldIcon className="w-4 h-4" />
                    </button>
                    <button onClick={() => wrapSelection('*', '*')} className="p-1.5 hover:bg-white rounded-md text-stone-600 hover:text-black transition-all" title="ตัวเอียง">
                        <ItalicIcon className="w-4 h-4" />
                    </button>
                </div>

                 {/* 3. Font & Color */}
                 <div className="flex items-center bg-stone-100 rounded-lg p-1 border border-stone-200 gap-1 relative">
                    {/* Color Picker */}
                    <div className="relative flex items-center group">
                        <label htmlFor="color-picker" className="p-1.5 hover:bg-white rounded-md text-stone-600 hover:text-black transition-all cursor-pointer flex items-center gap-1">
                            <SwatchIcon className="w-4 h-4" style={{ color: textColor }} />
                        </label>
                        <input 
                            id="color-picker"
                            type="color" 
                            value={textColor}
                            onChange={(e) => {
                                setTextColor(e.target.value);
                                applyColor(e.target.value);
                            }}
                            className="absolute opacity-0 w-8 h-8 cursor-pointer"
                        />
                    </div>
                    
                    {/* Font Family */}
                    <div className="relative">
                        <button 
                            onClick={() => setShowFontPicker(!showFontPicker)}
                            className="p-1.5 hover:bg-white rounded-md text-stone-600 hover:text-black transition-all text-xs font-serif font-bold px-2 w-20 truncate text-left"
                            title="เลือกฟอนต์"
                        >
                            ฟอนต์...
                        </button>
                        {showFontPicker && (
                            <div className="absolute top-full left-0 mt-1 bg-white border border-stone-200 rounded-lg shadow-xl py-1 w-48 z-20">
                                {FONT_OPTIONS.map((font) => (
                                    <button
                                        key={font.label}
                                        onClick={() => applyFont(font.value)}
                                        className="w-full text-left px-4 py-2 text-sm text-stone-700 hover:bg-purple-50 hover:text-purple-700"
                                    >
                                        {font.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* 4. Alignment */}
                <div className="flex items-center bg-stone-100 rounded-lg p-1 border border-stone-200 gap-1">
                    <button onClick={() => applyAlignment('left')} className="p-1.5 hover:bg-white rounded-md text-stone-600 hover:text-black transition-all" title="ชิดซ้าย">
                        <Bars3BottomLeftIcon className="w-4 h-4" />
                    </button>
                    <button onClick={() => applyAlignment('center')} className="p-1.5 hover:bg-white rounded-md text-stone-600 hover:text-black transition-all" title="กึ่งกลาง">
                         <div className="flex flex-col gap-[2px] items-center w-4">
                            <div className="h-[2px] w-3 bg-current rounded-full"></div>
                            <div className="h-[2px] w-4 bg-current rounded-full"></div>
                            <div className="h-[2px] w-3 bg-current rounded-full"></div>
                         </div>
                    </button>
                    <button onClick={() => applyAlignment('right')} className="p-1.5 hover:bg-white rounded-md text-stone-600 hover:text-black transition-all" title="ชิดขวา">
                        <Bars3BottomRightIcon className="w-4 h-4" />
                    </button>
                </div>

                {/* 5. Media & Emoji */}
                <div className="flex items-center bg-stone-100 rounded-lg p-1 border border-stone-200 gap-1 relative">
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="p-1.5 hover:bg-white rounded-md text-stone-600 hover:text-black transition-all"
                        title="อัปโหลดรูป"
                    >
                        <PhotoIcon className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={() => {
                            const url = prompt("กรุณาระบุ URL ของรูปภาพ:");
                            if (url) handleInsertImage(url);
                        }}
                        className="p-1.5 hover:bg-white rounded-md text-stone-600 hover:text-black transition-all"
                        title="แทรกรูปจาก URL"
                    >
                        <LinkIcon className="w-4 h-4" />
                    </button>
                    
                    {/* Emoji */}
                    <div className="relative">
                        <button 
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            className="p-1.5 hover:bg-white rounded-md text-stone-600 hover:text-purple-500 transition-all"
                            title="แทรกอีโมจิ"
                        >
                            <FaceSmileIcon className="w-4 h-4" />
                        </button>
                        {showEmojiPicker && (
                            <div className="absolute top-full left-0 mt-1 bg-white border border-stone-200 rounded-lg shadow-xl p-2 w-64 z-20 grid grid-cols-6 gap-1 h-48 overflow-y-auto custom-scrollbar">
                                {COMMON_EMOJIS.map((emoji) => (
                                    <button
                                        key={emoji}
                                        onClick={() => {
                                            insertTextAtCursor(emoji);
                                            setShowEmojiPicker(false);
                                        }}
                                        className="text-xl hover:bg-stone-100 p-1 rounded transition-colors"
                                    >
                                        {emoji}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileUpload} 
                        className="hidden" 
                        accept="image/*"
                    />
                </div>

                <div className="w-px h-6 bg-stone-300 mx-2"></div>

                {/* AI Tools */}
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-purple-500 uppercase tracking-wider flex items-center gap-1">
                        <SparklesIcon className="w-3 h-3" /> AI
                    </span>
                    <button 
                        onClick={() => handleAiEdit('grammar')}
                        className="flex items-center gap-1 px-2 py-1.5 bg-white border border-purple-200 rounded-lg text-xs font-medium text-stone-700 hover:bg-purple-50 hover:text-purple-800 transition-colors whitespace-nowrap"
                    >
                        <CheckBadgeIcon className="w-3 h-3 text-emerald-500" /> แก้คำผิด
                    </button>
                    <button 
                        onClick={() => handleAiEdit('rephrase')}
                        className="flex items-center gap-1 px-2 py-1.5 bg-white border border-purple-200 rounded-lg text-xs font-medium text-stone-700 hover:bg-purple-50 hover:text-purple-800 transition-colors whitespace-nowrap"
                    >
                        <ArrowsRightLeftIcon className="w-3 h-3 text-blue-500" /> เรียบเรียงใหม่
                    </button>
                </div>
            </div>

            <div className="flex-1 p-0 relative bg-purple-50/30">
              <textarea
                ref={textareaRef}
                value={editingContent}
                onChange={(e) => setEditingContent(e.target.value)}
                className="w-full h-full p-8 resize-none focus:outline-none text-stone-800 leading-relaxed font-sarabun text-base bg-transparent"
                placeholder="เริ่มพิมพ์เนื้อหาที่นี่... คุณสามารถใช้เครื่องมือด้านบนเพื่อจัดรูปแบบได้"
              />
            </div>
            
            <div className="p-4 border-t border-stone-100 flex justify-end gap-3 bg-stone-50">
              <button 
                onClick={cancelEditing}
                className="px-5 py-2.5 text-stone-600 hover:bg-stone-200 rounded-xl font-medium transition-colors"
              >
                ยกเลิก
              </button>
              <button 
                onClick={saveEditing}
                className="px-6 py-2.5 bg-purple-600 text-white hover:bg-purple-700 rounded-xl font-bold shadow-lg shadow-purple-200 flex items-center gap-2 transition-colors"
              >
                <CheckIcon className="w-5 h-5" /> บันทึกการแก้ไข
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar / Cover */}
      <div className="w-full lg:w-1/3 flex flex-col gap-6">
        <div className="bg-white p-5 rounded-2xl shadow-lg border border-stone-200 transform hover:scale-[1.02] transition-transform duration-300 relative group">
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none"></div>
            {ebook.coverImage ? (
                <img 
                    src={ebook.coverImage} 
                    alt="Book Cover" 
                    className="w-full rounded-lg shadow-md aspect-[3/4] object-cover"
                />
            ) : (
                <div className="w-full aspect-[3/4] bg-stone-100 rounded-lg flex flex-col items-center justify-center text-stone-400 gap-2 border-2 border-dashed border-stone-200">
                   <PhotoIcon className="w-12 h-12 opacity-50" />
                   <span>ไม่มีรูปปก</span>
                </div>
            )}
        </div>
        
        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-stone-200">
            <h1 className="text-2xl font-bold text-stone-800 mb-2 font-promt">{ebook.title}</h1>
            <p className="text-sm text-stone-500 mb-4 bg-stone-100 inline-block px-2 py-1 rounded-md">{ebook.targetAudience}</p>
            <p className="text-stone-700 text-sm italic leading-relaxed">{ebook.description}</p>
        </div>

        {/* Export Actions */}
        <div className="bg-white/60 p-5 rounded-2xl border border-stone-200 space-y-3 shadow-sm">
            <h3 className="font-semibold text-stone-700 text-sm mb-2 flex items-center gap-2">
                <ArrowDownTrayIcon className="w-4 h-4 text-purple-600" /> ดาวน์โหลด / Export
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
                <button 
                    onClick={handleDownloadEPUB}
                    disabled={isExportingEPUB}
                    className="col-span-1 py-3 px-3 bg-purple-600 text-white border border-purple-600 rounded-xl hover:bg-purple-700 transition-all text-sm font-bold flex flex-col items-center justify-center gap-1 shadow-md shadow-purple-200 disabled:opacity-50 disabled:cursor-wait"
                >
                    {isExportingEPUB ? (
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    ) : (
                        <BookOpenIcon className="w-5 h-5" /> 
                    )}
                    <span>EPUB</span>
                </button>

                <button 
                    onClick={handlePrintPDF}
                    className="col-span-1 py-3 px-3 bg-white border border-stone-200 rounded-xl text-stone-700 hover:bg-pink-50 hover:border-pink-200 hover:text-pink-700 transition-all text-sm font-bold flex flex-col items-center justify-center gap-1 shadow-sm"
                >
                    <PrinterIcon className="w-5 h-5" />
                    <span>PDF (Print)</span>
                </button>
            </div>
            
            <div className="flex gap-2 pt-1">
                <button 
                    onClick={handleDownloadHTML}
                    className="flex-1 py-2 px-2 bg-white border border-stone-200 rounded-lg text-stone-600 hover:bg-purple-50 transition-all text-xs font-medium flex items-center justify-center gap-2"
                >
                    <CodeBracketIcon className="w-3 h-3" /> HTML
                </button>
                <button 
                    onClick={handleDownloadMarkdown}
                    className="flex-1 py-2 px-2 bg-white border border-stone-200 rounded-lg text-stone-600 hover:bg-purple-50 transition-all text-xs font-medium flex items-center justify-center gap-2"
                >
                    <DocumentTextIcon className="w-3 h-3" /> Markdown
                </button>
            </div>
            <p className="text-[10px] text-stone-400 text-center">
                *PDF ใช้ฟังก์ชันพิมพ์ของเบราว์เซอร์เพื่อคุณภาพสูงสุด
            </p>
        </div>

        <button 
            onClick={onRestart}
            className="w-full py-3.5 bg-purple-900 text-white rounded-xl hover:bg-purple-800 transition-all font-medium mt-auto shadow-lg shadow-purple-300 flex justify-center items-center gap-2"
        >
            <ArrowPathIcon className="w-4 h-4" /> เริ่มโปรเจกต์ใหม่
        </button>
      </div>

      {/* Content Reader */}
      <div className="w-full lg:w-2/3 bg-white rounded-3xl shadow-xl shadow-purple-200/50 border border-stone-100 flex flex-col h-[850px] overflow-hidden">
        {/* Reader Header */}
        <div className="p-5 border-b border-stone-100 flex justify-between items-center bg-purple-50/50">
            <h2 className="font-bold text-stone-700 flex items-center gap-2">
                <BookOpenIcon className="w-5 h-5 text-purple-600" /> 
                ตัวอย่างเนื้อหาหนังสือ
            </h2>
            <div className="text-sm text-stone-500 bg-white px-3 py-1 rounded-full border border-stone-200 shadow-sm">
                {ebook.chapters[activeChapter].id === 'ch-conclusion' 
                    ? 'บทส่งท้าย' 
                    : `บทที่ ${activeChapter + 1}`} 
                <span className="text-stone-300 mx-2">|</span>
                {ebook.chapters.length} ส่วน
            </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
            {/* TOC */}
            <div className="w-1/3 border-r border-stone-100 overflow-y-auto bg-purple-50/30 custom-scrollbar">
                <ul className="divide-y divide-stone-100">
                    {ebook.chapters.map((chapter, idx) => (
                        <li key={chapter.id} className="group relative hover:bg-purple-50/50 transition-colors">
                            <button
                                onClick={() => setActiveChapter(idx)}
                                className={`w-full text-left p-5 text-sm pr-12 transition-all ${activeChapter === idx ? 'bg-white text-purple-800 font-semibold border-l-4 border-purple-500 shadow-sm' : 'text-stone-600'}`}
                            >
                                <span className="block text-xs text-stone-400 mb-1 uppercase tracking-wider">
                                    {chapter.id === 'ch-conclusion' ? 'บทส่งท้าย' : `บทที่ ${idx + 1}`}
                                </span>
                                {chapter.title}
                            </button>
                            {/* Edit Button */}
                            <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  startEditing(idx, chapter.content || "");
                                }}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-stone-300 hover:text-purple-600 hover:bg-purple-100 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                title="แก้ไขเนื้อหา"
                            >
                                <PencilSquareIcon className="w-4 h-4" />
                            </button>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Content */}
            <div className="w-2/3 overflow-y-auto p-10 bg-white custom-scrollbar">
                <h2 className="text-3xl font-bold text-stone-800 mb-8 border-b-2 border-purple-100 pb-6 font-promt leading-tight">
                    {ebook.chapters[activeChapter].title}
                </h2>
                <div className="prose prose-stone prose-lg max-w-none text-stone-700 leading-relaxed font-sarabun">
                    <ReactMarkdown components={{
                      img: ({node, ...props}) => <img style={{maxWidth: '100%', borderRadius: '12px', margin: '30px auto', display:'block', boxShadow: '0 4px 12px rgba(0,0,0,0.08)'}} {...props} />,
                      h2: ({node, ...props}) => <h2 className="text-purple-800 font-bold mt-8 mb-4" {...props} />,
                      h3: ({node, ...props}) => <h3 className="text-stone-800 font-semibold mt-6 mb-3" {...props} />,
                      blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-purple-300 bg-purple-50 p-4 italic rounded-r-lg my-6 text-stone-600" {...props} />,
                      // Allow inline styles
                      div: ({node, ...props}) => <div {...props} />,
                      span: ({node, ...props}) => <span {...props} />,
                    }} rehypePlugins={[]}>
                        {ebook.chapters[activeChapter].content || "ยังไม่มีเนื้อหา"}
                    </ReactMarkdown>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};