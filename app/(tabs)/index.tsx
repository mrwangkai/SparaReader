// Updated app/(tabs)/index.tsx with vertical sections and scrollable carousel

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Text,
  TextInput,
  Button,
  Card,
  Title,
  Paragraph,
  Portal,
  Modal,
} from 'react-native-paper';

const screenWidth = Dimensions.get('window').width;
const CARD_WIDTH = 200;
const CARD_HEIGHT = 200;
const firstName = 'Kai';

export type Article = {
  id: string;
  url: string;
  title: string;
  summary: string;
  topics: string[];
};

export default function ArticleListScreen() {
  const [url, setUrl] = useState('');
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    const stored = await AsyncStorage.getItem('articles');
    if (stored) setArticles(JSON.parse(stored));
  };

  const saveArticles = async (newArticles: Article[]) => {
    await AsyncStorage.setItem('articles', JSON.stringify(newArticles));
  };

  const extractSummary = async (url: string): Promise<{ title: string; summary: string }> => {
    try {
      const response = await fetch(url);
      const html = await response.text();
      const titleMatch = html.match(/<title>(.*?)<\/title>/i);
      const metaMatch = html.match(/<meta name="description" content="(.*?)"/i);
      const paragraphMatch = html.match(/<p>(.*?)<\/?p>/i);

      const title = titleMatch ? titleMatch[1] : `Untitled`;
      const summary = metaMatch
        ? metaMatch[1]
        : paragraphMatch
        ? paragraphMatch[1].split(' ').slice(0, 15).join(' ') + '...'
        : 'No summary available.';

      return { title, summary };
    } catch {
      return { title: url, summary: 'Failed to extract summary.' };
    }
  };

  const handleAdd = async () => {
    if (!url) return;
    const { title, summary } = await extractSummary(url);
    const article = {
      id: Date.now().toString(),
      url,
      title,
      summary,
      topics: [],
    };
    const updated = [article, ...articles];
    setArticles(updated);
    saveArticles(updated);
    setUrl('');
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Section 1: Greeting */}
        <Text variant="titleLarge" style={styles.greeting}>
          {getGreeting()}, {firstName}! You’ve saved {articles.length} article{articles.length !== 1 ? 's' : ''}.
        </Text>

        {/* Section 2: Add Article */}
        <View style={styles.inputSection}>
          <TextInput
            label="Enter article URL"
            value={url}
            onChangeText={setUrl}
            mode="outlined"
            style={styles.input}
          />
          <Button mode="contained" onPress={handleAdd} style={styles.button}>
            Add Article
          </Button>
          <Text style={styles.addTagHint}>+ Add tags/categories (coming soon)</Text>
        </View>

        {/* Section 3: Article Carousel */}
        <Text variant="titleMedium" style={styles.sectionTitle}>📚 Recent Articles</Text>
        <FlatList
          horizontal
          data={articles}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.carousel}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => setSelectedArticle(item)}>
              <Card style={styles.card}>
                <Card.Content>
                  <Title numberOfLines={2}>{item.title}</Title>
                  <Paragraph numberOfLines={4}>{item.summary}</Paragraph>
                  {item.topics.length === 0 && (
                    <Text style={styles.addTagPrompt}>+ Add category</Text>
                  )}
                </Card.Content>
              </Card>
            </TouchableOpacity>
          )}
        />
      </ScrollView>

      {/* Modal for article zoom view */}
      <Portal>
        <Modal
          visible={!!selectedArticle}
          onDismiss={() => setSelectedArticle(null)}
          contentContainerStyle={styles.modal}
        >
          {selectedArticle && (
            <View>
              <Title>{selectedArticle.title}</Title>
              <Paragraph>{selectedArticle.summary}</Paragraph>
              <Button onPress={() => setSelectedArticle(null)}>Close</Button>
            </View>
          )}
        </Modal>
      </Portal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 60 },
  greeting: { marginBottom: 30 },
  inputSection: { width: '100%', marginBottom: 30 },
  input: { marginBottom: 10 },
  button: { marginBottom: 10 },
  addTagHint: { fontSize: 12, color: 'gray' },
  sectionTitle: { marginBottom: 10 },
  carousel: { paddingBottom: 20 },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    marginRight: 12,
    justifyContent: 'center',
  },
  addTagPrompt: { fontStyle: 'italic', color: 'gray', marginTop: 6 },
  modal: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 10,
  },
});
