import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
// @ts-ignore
import { getInstalledApps } from 'react-native-get-app-list';

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

interface AppInfo {
  appName: string;
  packageName: string;
  versionName: string;
}

const StatisticsPage: React.FC = () => {
  const [statistics, setStatistics] = useState<any[]>([]);
  const [hourStats, setHourStats] = useState<any[]>([]);
  const [apps, setApps] = useState<AppInfo[]>([]);
  const [selectedApps, setSelectedApps] = useState<Set<string>>(new Set());

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
              startHour: task.startHour,
              endHour: task.endHour,
            };
          }

          return null;
        }).filter(stat => stat !== null);

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

        const result = await getInstalledApps();
        setApps(result);
      } catch (error) {
        console.error("Error fetching statistics:", error);
      }
    };

    fetchData();
  }, []);

  const toggleAppSelection = async (packageName: string) => {
    setSelectedApps(prev => {
      const newSet = new Set(prev);
      if (newSet.has(packageName)) {
        newSet.delete(packageName);
      } else {
        newSet.add(packageName);
      }
      AsyncStorage.setItem('banned_apps', JSON.stringify(Array.from(newSet)));
      return newSet;
    });
  };

  return (
    <ScrollView style={styles.container}>
<View style={styles.headerRow}>
  <TouchableOpacity onPress={() => router.push('/')} style={styles.backButton}>
    <Image source={require('@/assets/images/left.png')} style={styles.backIcon} />
  </TouchableOpacity>
  <Text style={styles.header}>Statistici</Text>
</View>

      {statistics.length > 0 ? (
        <>
          <View style={styles.statRow}>
            <Text style={styles.statHeaderText}>Activitate</Text>
            <Text style={styles.statHeaderText}>★ Medie</Text>
            <Text style={styles.statHeaderText}>% Reușită</Text>
            <Text style={styles.statHeaderText}>Streak</Text>
          </View>

          {statistics.map((item, index) => (
            <View key={index} style={styles.statRow}>
              <Text style={styles.statText}>{item.taskName}</Text>
              <Text style={styles.statText}>{item.averageRating}⭐</Text>
              <Text style={styles.statText}>{item.passRate}%</Text>
              <Text style={styles.statText}>{item.streak !== 0 ? `🔥 ${item.streak}x` : '-'}</Text>
            </View>
          ))}

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
        <Text style={styles.noDataText}>Nu există statistici</Text>
      )}

      <Text style={styles.subHeader}>Alege aplicații interzise în timpul activităților</Text>
      {apps.map((app, index) => (
        <TouchableOpacity
          key={index}
          style={[styles.statItem, selectedApps.has(app.packageName) && styles.appSelected]}
          onPress={() => toggleAppSelection(app.packageName)}
        >
          <Text style={styles.statText}>{app.appName}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 5,
    paddingHorizontal: 16,
    backgroundColor: '#f0f0f0',
  },
  headerRow: {
    position: 'relative',
    height: 40,
    justifyContent: 'center',
    marginBottom: 20,
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    zIndex: 2,
    justifyContent: 'center',
    alignItems: 'center',
    width: 40, 
    height: 40,
  },
  backIcon: {
    width: 30,
    height: 30,
  },
  header: {
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
  },
  subHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
    elevation: 3,
  },
  statHeaderText: {
    fontSize: 14,
    fontWeight: 'bold',
    flex: 1,
    color: '#444',
  },
  statText: {
    fontSize: 16,
    flex: 1,
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
  statItem: {
    backgroundColor: '#fff',
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
    elevation: 3,
  },
  appSelected: {
    backgroundColor: '#ffd6d6',
  },
});


export default StatisticsPage;
