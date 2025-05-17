import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView, TouchableOpacity,Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

interface TaskStat {
  taskIndex: number;
  rating: number;
  passed: boolean;
}

interface Task {
  name: string;
  taskIndex: number;
}

const StatisticsPage: React.FC = () => {
  const [statistics, setStatistics] = useState<any[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedTasks = await AsyncStorage.getItem('task');
        const parsedTasks: Task[] = storedTasks ? JSON.parse(storedTasks) : [];
  
        const existingStats = await AsyncStorage.getItem("task_statistics");
        const statsArray: TaskStat[][] = existingStats ? JSON.parse(existingStats) : [];
  
        const statsWithAverages = parsedTasks.map((task, index) => {
          const taskStats = statsArray[index] || [];
  
          if (taskStats.length > 0) {
            const totalRatings = taskStats.reduce((sum, stat) => sum + stat.rating, 0);
            const averageRating = totalRatings / taskStats.length;
  
            const passedCount = taskStats.filter(stat => stat.passed).length;
            const failedCount = taskStats.length - passedCount;
            const passRate = (passedCount / taskStats.length) * 100;
  
            return {
              taskName: task.name,
              averageRating: averageRating.toFixed(1),
              passRate: passRate.toFixed(1),
            };
          }
  
          return null;
        }).filter(stat => stat !== null);
  
        setTasks(parsedTasks);
        setStatistics(statsWithAverages);
      } catch (error) {
        console.error("Error fetching statistics:", error);
      }
    };
  
    fetchData();
  }, []);
  

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.statItem}>
      <Text style={styles.statText}>
        {item.taskName}: {item.averageRating} stele, {item.passRate}% completare
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
  subHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  statItem: {
    backgroundColor: '#fff',
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statText: {
    fontSize: 16,
    color: '#333',
  },
  noDataText: {
    fontSize: 18,
    textAlign: 'center',
    color: '#888',
  },
  questionContainer: {
    marginBottom: 20,
  },
  question: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  answer: {
    fontSize: 16,
    color: '#555',
    marginTop: 5,
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
