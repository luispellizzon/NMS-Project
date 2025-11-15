// src/components/ui/patients/TestHistory.tsx
'use client';

import { motion } from 'framer-motion';
import { Download, FileText, Brain } from 'lucide-react';
import { TestHistoryItem } from '@/types/testHistory';

interface TestHistoryProps {
  testHistory: TestHistoryItem[];
}

const TestHistory = ({ testHistory }: TestHistoryProps) => {
  const getTestIcon = (testType: 'speech' | 'memory') => {
    if (testType === 'speech') {
      return <FileText className="w-4 h-4 text-purple-500" />;
    }
    return <Brain className="w-4 h-4 text-blue-500" />;
  };

  const handleDownload = (item: TestHistoryItem) => {
    // TODO: Implement download functionality
    console.log('Download test result:', item.id);
  };

  if (testHistory.length === 0) {
    return (
      <div className="bg-card rounded-lg border shadow-sm p-8">
        <div className="text-center text-muted-foreground">
          <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No test history available</p>
          <p className="text-sm mt-2">Test results will appear here once the patient completes assessments</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border shadow-sm overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="bg-muted/50">
          <tr>
            <th className="p-4 font-semibold text-muted-foreground">Type</th>
            <th className="p-4 font-semibold text-muted-foreground">Date</th>
            <th className="p-4 font-semibold text-muted-foreground">Test</th>
            <th className="p-4 font-semibold text-muted-foreground">Time Taken</th>
            <th className="p-4 font-semibold text-muted-foreground">Score</th>
            <th className="p-4 font-semibold text-muted-foreground">Actions</th>
          </tr>
        </thead>
        <tbody>
          {testHistory.map((item) => (
            <motion.tr
              key={item.id}
              className="border-b last:border-b-0 hover:bg-accent/50 transition-colors"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <td className="p-4">
                <div className="flex items-center gap-2">
                  {getTestIcon(item.testType)}
                </div>
              </td>
              <td className="p-4 text-muted-foreground">{item.date}</td>
              <td className="p-4 font-medium text-foreground">{item.test}</td>
              <td className="p-4 text-muted-foreground">{item.timeTaken}</td>
              <td className="p-4">
                <span className="font-semibold text-foreground">{item.score}</span>
              </td>
              <td className="p-4">
                <button
                  onClick={() => handleDownload(item)}
                  className="p-2 hover:bg-accent rounded-md text-muted-foreground hover:text-foreground transition-colors"
                  title="Download test results"
                >
                  <Download className="w-5 h-5" />
                </button>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TestHistory;