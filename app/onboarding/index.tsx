import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { ChevronRight, Code, Trophy, Languages } from 'lucide-react-native';

const onboardingSteps = [
  {
    id: 1,
    title: 'Learn Programming Languages',
    subtitle: 'Choose your path',
    description: 'Pick a language to start with: JavaScript, Python, PHP, or Ruby. You can switch anytime.',
    icon: Languages,
    color: '#6366F1'
  },
  {
    id: 2,
    title: 'Practice Coding',
    subtitle: 'Write real code',
    description: 'Apply what you learn with interactive coding exercises. Run your code instantly and see the results.',
    icon: Code,
    color: '#8B5CF6'
  },
  {
    id: 3,
    title: 'Track Progress',
    subtitle: 'Stay motivated',
    description: 'Monitor your learning journey with detailed progress tracking, streaks, and achievements.',
    icon: Trophy,
    color: '#10B981'
  }
];

export default function OnboardingScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedLang, setSelectedLang] = useState<'javascript' | 'python' | 'php' | 'ruby'>('javascript');
  
  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // TODO: Set onboarding completed flag in user preferences
      router.replace({ pathname: '/(tabs)', params: { lang: selectedLang } });
    }
  };

  const handleSkip = () => {
    // TODO: Set onboarding completed flag in user preferences
    router.replace({ pathname: '/(tabs)', params: { lang: selectedLang } });
  };

  const step = onboardingSteps[currentStep];
  const IconComponent = step.icon;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Skip Button */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleSkip}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>

        {/* Icon */}
        <View style={[styles.iconContainer, { backgroundColor: step.color + '20' }]}>
          <IconComponent size={64} color={step.color} />
        </View>

        {/* Content */}
        <View style={styles.textContent}>
          <Text style={styles.title}>{step.title}</Text>
          <Text style={styles.subtitle}>{step.subtitle}</Text>
          <Text style={styles.description}>{step.description}</Text>
          {step.id === 1 && (
            <View style={styles.langRow}>
              {(['javascript','python','php','ruby'] as const).map(l => (
                <TouchableOpacity
                  key={l}
                  style={[styles.langPill, selectedLang === l && styles.langPillActive]}
                  onPress={() => setSelectedLang(l)}
                >
                  <Text style={[styles.langPillText, selectedLang === l && styles.langPillTextActive]}>
                    {l === 'javascript' ? 'JavaScript' : l === 'python' ? 'Python' : l === 'php' ? 'PHP' : 'Ruby'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Progress Indicators */}
        <View style={styles.indicators}>
          {onboardingSteps.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                index === currentStep && styles.activeIndicator
              ]}
            />
          ))}
        </View>
      </ScrollView>

      {/* Next Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>
            {currentStep === onboardingSteps.length - 1 ? 'Get Started' : 'Next'}
          </Text>
          <ChevronRight size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 60,
  },
  header: {
    alignItems: 'flex-end',
    marginBottom: 40,
  },
  skipText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  textContent: {
    alignItems: 'center',
    marginBottom: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '500',
  },
  description: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 16,
  },
  langRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  langPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  langPillActive: {
    backgroundColor: '#EEF2FF',
    borderColor: '#6366F1',
  },
  langPillText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
  },
  langPillTextActive: {
    color: '#4F46E5',
  },
  indicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e5e7eb',
  },
  activeIndicator: {
    backgroundColor: '#3B82F6',
    width: 24,
  },
  footer: {
    padding: 32,
  },
  nextButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  nextButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
});