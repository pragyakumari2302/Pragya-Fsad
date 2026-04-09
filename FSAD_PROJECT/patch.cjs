const fs = require('fs');

function patchFile(filePath, findStr, replaceStr) {
    if (!fs.existsSync(filePath)) {
        console.log('File not found:', filePath);
        return;
    }
    let content = fs.readFileSync(filePath, 'utf-8');
    if (!content.includes(findStr)) {
        console.log('String not found in:', filePath);
        return;
    }
    content = content.replace(findStr, replaceStr);
    fs.writeFileSync(filePath, content);
    console.log('Successfully patched:', filePath);
}

patchFile('src/pages/Exam.jsx',
`import { Book, CheckCircle, CalendarDays, Clock, MapPin, Award, BookOpen, FileText } from "lucide-react";`,
`import { Book, CheckCircle, CalendarDays, Clock, MapPin, Award, BookOpen, FileText } from "lucide-react";
import html2pdf from "html2pdf.js";`);

patchFile('src/pages/Exam.jsx',
`<button className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-400 hover:to-violet-400 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-indigo-500/25 flex items-center gap-2">
          <BookOpen className="w-4 h-4" />
          <span>Exam Guidelines</span>
        </button>`,
`<button onClick={() => {
          const element = document.createElement('div');
          element.innerHTML = '<h1>Exam Guidelines</h1><br/><p>Please carefully read the instructions below before proceeding with your examinations...</p><br/><ul><li>Arrive 15 mins early</li><li>Bring ID card</li><li>No electronic devices</li></ul>';
          html2pdf().from(element).save('exam-guidelines.pdf');
        }} className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-400 hover:to-violet-400 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-indigo-500/25 flex items-center gap-2">
          <BookOpen className="w-4 h-4" />
          <span>Exam Guidelines</span>
        </button>`);
