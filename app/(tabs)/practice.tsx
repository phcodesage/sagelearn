import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { Play, RotateCcw, Check } from 'lucide-react-native';
import { codeExecutor } from '@/services/codeExecutor';
import { lessonService } from '@/services/lessonService';

interface PracticeLesson {
  id: string;
  title: string;
  prompt: string;
  starterCode: string;
  expectedOutput: string;
  hints: string[];
}

export default function PracticeScreen() {
  const [currentLesson, setCurrentLesson] = useState<PracticeLesson | null>(null);
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  
  useEffect(() => {
    loadPracticeLesson();
  }, []);

  const loadPracticeLesson = async () => {
    try {
      // TODO: Load based on user's current progress
      const practiceLesson = await lessonService.getPracticeLesson('variables-basics');
      setCurrentLesson(practiceLesson);
      if (practiceLesson) {
        setCode(practiceLesson.starterCode);
      } else {
        setCode('');
      }
    } catch (error) {
      console.error('Failed to load practice lesson:', error);
    }
  };

  const runCode = async () => {
    if (!code.trim()) return;
    
    setIsRunning(true);
    setOutput('');
    
    try {
      const result = await codeExecutor.execute(code);
      setOutput(result.output);
      
      // Check if the output matches expected result
      if (currentLesson && result.output.trim() === currentLesson.expectedOutput.trim()) {
        setIsCorrect(true);
        // TODO: Update user progress in database
        Alert.alert('🎉 Correct!', 'Well done! You\'ve completed this exercise.');
      } else {
        setIsCorrect(false);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setOutput(`Error: ${message}`);
      setIsCorrect(false);
    } finally {
      setIsRunning(false);
    }
  };

  const resetCode = () => {
    if (currentLesson) {
      setCode(currentLesson.starterCode);
      setOutput('');
      setIsCorrect(false);
    }
  };

  if (!currentLesson) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading practice exercise...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Practice</Text>
        <Text style={styles.lessonTitle}>{currentLesson.title}</Text>
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Execution Support Notice */}
        <View style={styles.noticeCard}>
          <Text style={styles.noticeText}>Note: Code execution currently supports JavaScript only. Other languages are view-only for now.</Text>
        </View>
        {/* Exercise Prompt */}
        <View style={styles.promptCard}>
          <Text style={styles.promptTitle}>Exercise</Text>
          <Text style={styles.promptText}>{currentLesson.prompt}</Text>
          <Text style={styles.expectedLabel}>Expected Output:</Text>
          <View style={styles.expectedOutput}>
            <Text style={styles.expectedText}>{currentLesson.expectedOutput}</Text>
          </View>
        </View>

        {/* Code Editor */}
        <View style={styles.editorCard}>
          <View style={styles.editorHeader}>
            <Text style={styles.editorTitle}>Your Code</Text>
            <View style={styles.editorActions}>
              <TouchableOpacity style={styles.actionButton} onPress={resetCode}>
                <RotateCcw size={16} color="#6b7280" />
                <Text style={styles.actionButtonText}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionButton, styles.runButton]} 
                onPress={runCode}
                disabled={isRunning}
              >
                <Play size={16} color="#ffffff" />
                <Text style={styles.runButtonText}>
                  {isRunning ? 'Running...' : 'Run'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <TextInput
            style={styles.codeEditor}
            value={code}
            onChangeText={setCode}
            multiline
            placeholder="Write your code here..."
            placeholderTextColor="#9ca3af"
            autoCapitalize="none"
            autoCorrect={false}
            spellCheck={false}
          />
        </View>

        {/* Output */}
        {output && (
          <View style={[styles.outputCard, isCorrect && styles.correctOutput]}>
            <View style={styles.outputHeader}>
              <Text style={styles.outputTitle}>Output</Text>
              {isCorrect && <Check size={20} color="#10B981" />}
            </View>
            <Text style={[styles.outputText, isCorrect && styles.correctOutputText]}>
              {output}
            </Text>
          </View>
        )}

        {/* TODO: Add hints section */}
        {/* <View style={styles.hintsCard}>
          <Text style={styles.hintsTitle}>Hints</Text>
          {currentLesson.hints.map((hint, index) => (
            <Text key={index} style={styles.hintText}>• {hint}</Text>
          ))}
        </View> */}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
    backgroundColor: '#ffffff',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  lessonTitle: {
    fontSize: 16,
    color: '#8B5CF6',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  promptCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  promptTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  promptText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    marginBottom: 16,
  },
  expectedLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
  },
  expectedOutput: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 12,
  },
  expectedText: {
    fontFamily: 'monospace',
    fontSize: 14,
    color: '#1f2937',
  },
  editorCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  editorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  editorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  editorActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#d1d5db',
    gap: 4,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
  },
  runButton: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  runButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#ffffff',
  },
  codeEditor: {
    fontFamily: 'monospace',
    fontSize: 14,
    color: '#1f2937',
    padding: 16,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  outputCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  correctOutput: {
    borderWidth: 2,
    borderColor: '#10B981',
  },
  outputHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  outputTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  outputText: {
    fontFamily: 'monospace',
    fontSize: 14,
    padding: 16,
    backgroundColor: '#1f2937',
    color: '#ffffff',
  },
  correctOutputText: {
    color: '#ffffff',
  },
  noticeCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginBottom: 16,
  },
  noticeText: {
    color: '#92400E',
    fontSize: 12,
  },
});