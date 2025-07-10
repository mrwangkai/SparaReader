// app/(tabs)/index.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Article = {
  id: string;
  url: string;
  title: string;
  summary: string;
  topics: string[];
};


export default function ArticleListScreen() {
  const [url, setUrl] = useState('');
  const [articles, setArticles] = useState<Article[]>([]);

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

  const handleAdd = async () => {
    if (!url) return;
    const article = {
      id: Date.now().toString(),
      url,
      title: `Title for ${url}`,
      summary: 'This is a placeholder summary.',
      topics: ['general'],
    };
    const updated = [article, ...articles];
    setArticles(updated);
    saveArticles(updated);
    setUrl('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>📥 Add Article</Text>
      <TextInput
        value={url}
        onChangeText={setUrl}
        placeholder="Enter article URL"
        style={styles.input}
      />
      <Button title="Add Article" onPress={handleAdd} />
      <Text style={styles.header}>📚 Saved Articles</Text>
      <FlatList
        data={articles}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.article}>
            <Text style={styles.title}>{item.title}</Text>
            <Text>{item.summary}</Text>
            <Text style={styles.topics}>{item.topics.join(', ')}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 50 },
  input: { borderWidth: 1, padding: 8, marginBottom: 10 },
  header: { fontSize: 18, fontWeight: 'bold', marginTop: 20 },
  article: { marginVertical: 10, padding: 10, backgroundColor: '#f0f0f0' },
  title: { fontWeight: 'bold' },
  topics: { fontStyle: 'italic', color: 'gray' },
});
