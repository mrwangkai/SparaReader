import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Stats = {
  count: number;
  topics: Record<string, number>; // e.g. { "sports": 4, "politics": 2 }
};

export default function SummaryScreen() {
  const [stats, setStats] = useState<Stats>({ count: 0, topics: {} });

  useEffect(() => {
    const loadStats = async () => {
      const stored = await AsyncStorage.getItem('articles');
      if (!stored) return;

      const articles = JSON.parse(stored) as {
        topics: string[];
      }[];

      const topicCount: Record<string, number> = {};

      articles.forEach((a) => {
        a.topics.forEach((topic) => {
          topicCount[topic] = (topicCount[topic] || 0) + 1;
        });
      });

      setStats({ count: articles.length, topics: topicCount });
    };

    loadStats();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📊 Reading Summary</Text>
      <Text style={styles.subtitle}>
        You've saved {stats.count} article{stats.count === 1 ? '' : 's'}.
      </Text>
      {Object.entries(stats.topics).map(
        ([topic, count]: [string, number]) => (
          <Text key={topic} style={styles.topicItem}>
            {count} on {topic}
          </Text>
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingTop: 50 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  subtitle: { fontSize: 16, marginBottom: 20 },
  topicItem: { fontSize: 14, paddingVertical: 2 },
});
