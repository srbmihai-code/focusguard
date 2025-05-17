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
  startHour: number;
  endHour: number;
  startMinute: number;
  endMinute: number;
}

const StatisticsPage: React.FC = () => {
  const [statistics, setStatistics] = useState<any[]>([]);
  const [hourStats, setHourStats] = useState<any[]>([]);

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

            // Calculate current streak
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
              startHour: task.startHour,
              endHour: task.endHour,
            };
          }

          return null;
        }).filter(stat => stat !== null);

        // Build hour-based data
        const hourMap: Record<number, number[]> = {};
        statsWithAverages.forEach(stat => {
          for (let h = stat.startHour; h <= stat.endHour; h++) {
            if (!hourMap[h]) hourMap[h] = [];
            hourMap[h].push(parseFloat(stat.averageRating));
          }
        });

        const graphData = Array.from({ length: 24 }, (_, hour) => {
          const ratings = hourMap[hour] || [];
          const avg = ratings.length > 0
            ? ratings.reduce((a, b) => a + b, 0) / ratings.length
            : 0;
          return {
            hour,
            label: `${hour}:00`,
            value: parseFloat(avg.toFixed(2)),
          };
        }).filter(d => d.value > 0);

        setStatistics(statsWithAverages);
        setHourStats(graphData);
      } catch (error) {
        console.error("Error fetching statistics:", error);
      }
    };

    fetchData();
  }, []);

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.statItem}>
      <Text style={styles.statText}>
        {item.taskName}: {item.averageRating}⭐, {item.passRate}% completare
        {item.streak !== 0 && ` 🔥 ${item.streak}x streak`}
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
        <>
          <FlatList
            data={statistics}
            renderItem={renderItem}
            keyExtractor={(_, index) => index.toString()}
          />

          <Text style={styles.subHeader}>Grafic medie stele/oră</Text>
          <View style={styles.graphContainer}>
            {hourStats.map((item, index) => (
              <View key={index} style={styles.barWrapper}>
                <Text style={styles.barLabel}>{item.label}</Text>
                <View style={styles.barRow}>
                  <View style={[styles.bar, { width: `${item.value * 20}%` }]} />
                  <Text style={styles.barValue}>{item.value}⭐</Text>
                </View>
              </View>
            ))}
          </View>
        </>
      ) : (
        <Text style={styles.noDataText}>Nu exista statistici</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 16,
    backgroundColor: '#f0f0f0',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  subHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 16,
  },
  statItem: {
    backgroundColor: '#fff',
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
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
    marginTop: 20,
  },
  graphContainer: {
    marginTop: 10,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
  },
  barWrapper: {
    marginBottom: 10,
  },
  barLabel: {
    fontSize: 12,
    color: '#555',
    marginBottom: 4,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bar: {
    height: 12,
    backgroundColor: '#4a90e2',
    borderRadius: 4,
    marginRight: 8,
  },
  barValue: {
    fontSize: 12,
    color: '#333',
    width: 50,
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
