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
        const statsArray: TaskStat[] = existingStats ? JSON.parse(existingStats) : [];
        
        const groupedStats: any = {};

        statsArray.forEach(stat => {
          const taskIndex = parseInt(stat.taskIndex);
          if (!groupedStats[taskIndex]) {
            groupedStats[taskIndex] = { ratings: [], passedCount: 0, failedCount: 0 };
          }

          groupedStats[taskIndex].ratings.push(stat.rating);
          if (stat.passed) groupedStats[taskIndex].passedCount++;
          else groupedStats[taskIndex].failedCount++;
        });
        console.log(groupedStats)
        const statsWithAverages = parsedTasks
          .map((task, index) => {
            const statsForTask = groupedStats[index];
            if (statsForTask) {
              const averageRating = statsForTask.ratings.reduce((a: number, b: number) => a + b, 0) / statsForTask.ratings.length;
              const passRate = (statsForTask.passedCount / (statsForTask.passedCount + statsForTask.failedCount)) * 100;
              return {
                taskName: task.name,
                averageRating: averageRating.toFixed(1),
                passRate: passRate.toFixed(1),
              };
            }
            return null;
          })
          .filter(stat => stat !== null);

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

  const questionsAndAnswers = [
    {
      question: "Ce fac daca e greu să mă apuc?",
      answers: [
        "Începe cu un task ușor și crește treptat dificultatea.",
        "Creează un mediu de lucru confortabil și fără distrageri pentru a te concentra mai bine.",
        "Foloseste functia de blocarea a telefonului din aplicatie."
      ]
    },
    {
      question: "Ce fac daca sunt distras?",
      answers: [
        "Adauga optiunea de a avea pauze",
        "Blochează notificările de pe telefon și alte surse de distragere pentru a te putea concentra mai mult.",
      ]
    },
    {
      question: "Ce fac daca am repetat aceleasi greseli?",
      answers: [
        "Foloseste mini-junalul din aplicatie pentru a nota ce probleme au fost si ce s-a imbunatatit astazi"
      ]
    },
    {
      question: "Ce fac daca mi-e greu să mențin o activitate pe termen lung",
      answers: [
        "Creează un sistem de recompense pentru a te motiva pe termen lung.",
        "Revizuiește obiectivele periodic și ajustează-ți planul în funcție de progresul tău.",
        "Găsește modalități de a face procesul mai interesant, astfel încât să rămână motivant pe termen lung."
      ]
    }
  ];

  return (
    <ScrollView style={styles.container}>
          <TouchableOpacity onPress={() => router.push('/')} style={styles.backButton}>
        <Image source={require('@/assets/images/left.png')} style={styles.backIcon} />
      </TouchableOpacity>
      <Text style={styles.header}>Statistici și Sfaturi</Text>
      
      <Text style={styles.subHeader}>Statistici ale taskurilor</Text>
      {statistics.length > 0 ? (
        <FlatList
          data={statistics}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
        />
      ) : (
        <Text style={styles.noDataText}>Nu exista statistici</Text>
      )}

      <Text style={styles.subHeader}>Sfaturi</Text>
      {questionsAndAnswers.map((item, index) => (
        <View key={index} style={styles.questionContainer}>
          <Text style={styles.question}>{item.question}</Text>
          {item.answers.map((answer, idx) => (
            <Text key={idx} style={styles.answer}>{answer}</Text>
          ))}
        </View>
      ))}
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
