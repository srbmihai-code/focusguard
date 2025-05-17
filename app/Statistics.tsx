import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView, TouchableOpacity, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

interface TaskStat {
  taskIndex: number;
  rating: number;
  passed: boolean;
}

interface Task {
  name: string;
}

const StatisticsPage: React.FC = () => {
  const [statistics, setStatistics] = useState<any[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedTasks = await AsyncStorage.getItem('task');
        const parsedTasks: Task[] = storedTasks ? JSON.parse(storedTasks) : [];

        const storedStats = await AsyncStorage.getItem('task_statistics');
        const statsArray: TaskStat[][] = storedStats ? JSON.parse(storedStats) : [];

        const statsWithExtras = parsedTasks.map((task, index) => {
          const taskStats = statsArray[index] || [];

          if (taskStats.length === 0) return null;

          const totalRatings = taskStats.reduce((sum, stat) => sum + stat.rating, 0);
          const averageRating = totalRatings / taskStats.length;

          const passedCount = taskStats.filter(stat => stat.passed).length;
          const passRate = (passedCount / taskStats.length) * 100;


          let streak = 0;
          for (let i = taskStats.length - 1; i >= 0; i--) {
            if (taskStats[i].passed) {
              streak++;
            } else {
              break;
            }
          }

          return {
            taskName: task.name,
            averageRating: averageRating.toFixed(1),
            passRate: passRate.toFixed(1),
            streak,
          };
        }).filter(stat => stat !== null);

        setTasks(parsedTasks);
        setStatistics(statsWithExtras);
      } catch (error) {
        console.error('Error fetching statistics:', error);
      }
    };

    fetchData();
  }, []);

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.statItem}>
      <Text style={styles.statText}>
        {item.taskName}: {item.averageRating}⭐, {item.passRate}% completare{ item.streak !==0 && `, 🔥 ${item.streak}x streak`}
      </Text>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity onPress={() => router.push('/')} style={styles.backButton}>
        <Image source={require('@/assets/images/left.png')} style={styles.backIcon} />
      </TouchableOpacity>

      <Text style={styles.header}>Statistici</Text>

      {statistics.length > 0 ? (
        <FlatList
          data={statistics}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
        />
      ) : (
        <Text style={styles.noDataText}>Nu exista statistici</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f0f0f0',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  statItem: {
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statText: {
    fontSize: 16,
    color: '#333',
  },
  noDataText: {
    fontSize: 18,
    textAlign: 'center',
    color: '#888',
    marginTop: 30,
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 10,
    zIndex: 1,
  },
  backIcon: {
    width: 30,
    height: 30,
  },
});

export default StatisticsPage;
