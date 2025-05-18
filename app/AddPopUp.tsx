import { StyleSheet, Text, View, TouchableOpacity, TextInput, Switch, ScrollView, Image } from 'react-native'
import React, { useEffect, useState } from 'react'
import Modal from "react-native-modal"
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker'

interface AddPopUpProps {
  visible: boolean
  onClose: () => void
  date?: string
  weekDay?: string
  index?: number
}

const AddPopUp: React.FC<AddPopUpProps> = ({ visible, onClose, date, weekDay, index }) => {
  const [name, setName] = useState('')
  const [startHour, setStartHour] = useState('')
  const [startMinute, setStartMinute] = useState('')
  const [endHour, setEndHour] = useState('')
  const [endMinute, setEndMinute] = useState('')
  const [breaksCount, setBreaksCount] = useState('0 pauze')
  const [breaksDuration, setBreaksDuration] = useState(5)
  const [details, setDetails] = useState('')
  const [repetition, setRepetition] = useState('one-time')
  const [steps, setSteps] = useState<string[]>([]);
  const [newStep, setNewStep] = useState('');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedWeekDay, setSelectedWeekDay] = useState<string | null>(null);
  useEffect(() => {
    (async () => {
      if (!date) {
        const storedData = await AsyncStorage.getItem("task");
        const tasks = storedData ? JSON.parse(storedData) : [];
        const task = tasks[index];

        if (task) {
          setName(task.name || "");
          setStartHour(task.startHour.toString() || "");
          setStartMinute(task.startMinute.toString() || "");
          setEndHour(task.endHour.toString() || "");
          setEndMinute(task.endMinute.toString() || "");
          setBreaksCount(task.breaksCount || "0 pauze");
          setBreaksDuration(task.breaksDuration ?? 5);
          setDetails(task.details || "");
          setRepetition(task.repetition || "one-time");
          setSteps(task.steps || []);
        }

        if (task?.day) setSelectedDate(task.day);
        if (task?.weekDay) setSelectedWeekDay(task.weekDay);
      }
      if (typeof date !== "undefined") {
        setSelectedDate(date);
      }
      if (typeof weekDay !== "undefined") {
        setSelectedWeekDay(weekDay);
      }
    })();
  }, [])
  const addStep = () => {
    if (newStep.trim() !== '') {
      setSteps([...steps, newStep.trim()]);
      setNewStep('');
    }
  };
  const handleAppSelect = (app: string) => {
    console.log("Selected app:", app);

  };
  const removeStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
  };
  const validateHour = (hour: string) => {
    const num = parseInt(hour);
    return num >= 0 && num < 24;
  };

  const validateMinute = (minute: string) => {
    const num = parseInt(minute);
    return num >= 0 && num < 60;
  };

  const handleSubmit = () => {
    if (!startHour || !startMinute || !endHour || !endMinute) {
      alert('Toate câmpurile pentru ore și minute trebuie completate');
      return;
    }
    if (!name) {
      alert('Completati numele');
      return;
    }
    if ((startHour && !validateHour(startHour)) || (startMinute && !validateMinute(startMinute)) ||
      (endHour && !validateHour(endHour)) || (endMinute && !validateMinute(endMinute))) {
      alert('Orele nu sunt introduse corect');
      return;
    }
    const startTime = parseInt(startHour) * 60 + parseInt(startMinute);
    const endTime = parseInt(endHour) * 60 + parseInt(endMinute);

    if (startTime >= endTime) {
      alert('Ora de început trebuie să fie înainte de ora de sfârșit');
      return;
    }
    if (name === '') {
      alert('Introduceti un nume')
      return;
    }
    updateTaskStorage()
    // TODO check if occupied
    onClose(true);

  };
  const handleDelete = async () => {
    const storedTasks = await AsyncStorage.getItem("task");
    const tasks = storedTasks ? JSON.parse(storedTasks) : [];
    
    const storedStats = await AsyncStorage.getItem("task_statistics");
    const statsArray = storedStats ? JSON.parse(storedStats) : [];
    
    if (typeof index !== "undefined" && tasks[index]) {
      tasks.splice(index, 1);
      await AsyncStorage.setItem("task", JSON.stringify(tasks));
    
      statsArray.splice(index, 1);
      await AsyncStorage.setItem("task_statistics", JSON.stringify(statsArray));
    
      console.log("Removed task and stats at index:", index);
    }
    
      onClose();

  };
  async function updateTaskStorage() {
    try {
      const storedData = await AsyncStorage.getItem('task');
      let tasks = storedData ? JSON.parse(storedData) : [];
      const task = {
        name,
        startHour: parseInt(startHour),
        startMinute: parseInt(startMinute),
        endHour: parseInt(endHour),
        endMinute: parseInt(endMinute),
        breaksCount,
        breaksDuration,
        details,
        repetition,
        steps,
        startDate: Date.now(),
        weekDay: selectedWeekDay,
        day: typeof date !== "undefined" ? `${selectedDate} ${new Date().getFullYear()}` : selectedDate
      };
      if (typeof index !== "undefined" && tasks[index]) {
        tasks[index] = task
      }
      else {
        tasks = [...tasks, task]
      }
      console.log(tasks)
      await AsyncStorage.setItem('task', JSON.stringify(tasks));
      console.log('Task storage updated:', tasks);
    } catch (error) {
      console.error('Error updating task storage:', error);
    }
  };


  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      swipeDirection="down"
      propagateSwipe={true}
    >
      <ScrollView>
        <View style={styles.overlay}>
          <View style={styles.popup}>
            <Text style={styles.title}>Adaugă activitate / obiectiv</Text>

            <TextInput style={styles.input} placeholder="Nume activitate" value={name} onChangeText={setName} spellCheck={false}/>
            <View style={styles.row}>
              <Text>De la:</Text>
              <TextInput
                style={styles.inputSmall}
                placeholder="Oră"
                keyboardType="numeric"
                spellCheck={false}
                value={startHour}
                onChangeText={setStartHour}
                maxLength={2}
              />
              <Text>:</Text>
              <TextInput
                style={styles.inputSmall}
                placeholder="Minut"
                keyboardType="numeric"
                value={startMinute}
                spellCheck={false}
                onChangeText={setStartMinute}
                maxLength={2}
              />
            </View>

            <View style={styles.row}>
              <Text>Până la:</Text>
              <TextInput
                style={styles.inputSmall}
                placeholder="Oră"
                keyboardType="numeric"
                value={endHour}
                spellCheck={false}
                onChangeText={setEndHour}
                maxLength={2}
              />
              <Text>:</Text>
              <TextInput
                style={styles.inputSmall}
                placeholder="Minut"
                keyboardType="numeric"
                spellCheck={false}
                value={endMinute}
                onChangeText={setEndMinute}
                maxLength={2}
              />
            </View>



            <View style={styles.stepsContainer}>
              <Text style={styles.label}>Primii pași</Text>
              <Text style={styles.smallText}>Aici puteți nota primii pași pentru a începe mai ușor și a avea mai multe șanse să finalizați obiectivul.</Text>
              <View style={styles.stepInputRow}>
                <TextInput
                  style={styles.input}
                  spellCheck={false}
                  autoCorrect={false}
                  placeholder="Adaugă un pas"
                  value={newStep}
                  onChangeText={setNewStep}
                />
                <TouchableOpacity style={styles.addButton} onPress={addStep}>
                  <Text style={styles.addButtonText}>+</Text>
                </TouchableOpacity>
              </View>

              {steps.map((step, index) => (
                <View key={index} style={styles.stepItem}>
                  <Text style={styles.stepText}>{step}</Text>
                  <TouchableOpacity onPress={() => removeStep(index)}>
                    <Text style={styles.removeButton}>✖</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            <View style={styles.row}>
              <Text>Număr de pauze:</Text>
              <Picker
                selectedValue={breaksCount}
                onValueChange={setBreaksCount}
                style={styles.picker}
              >
                {['0 pauze', '1 pauză', '2 pauze', '3 pauze'].map((count) => (
                  <Picker.Item key={count} label={count} value={count} />
                ))}
              </Picker>
            </View>
            {breaksCount[0] !== '0' &&
              <View style={styles.row}>
                <Text>Durata pauzei:</Text>
                <Picker
                  selectedValue={breaksDuration}
                  onValueChange={setBreaksDuration}
                  style={styles.picker}
                >
                  {['5', '10', '15', '20', '25', '30'].map((duration) => (
                    <Picker.Item key={duration} label={`${duration} min`} value={duration} />
                  ))}
                </Picker>
              </View>}

            <TextInput style={[styles.input, styles.largeInput]} spellCheck={false} placeholder="Detalii opționale" multiline value={details} onChangeText={setDetails} />

            <View style={styles.row}>
              <Text>Repetiție</Text>
              <Picker selectedValue={repetition} onValueChange={setRepetition} style={styles.picker}>
                <Picker.Item label={`Doar ziua asta (${selectedDate})`} value="one-time" />
                <Picker.Item label="Aceeași zi a săptămânii" value="same-weekday" />
                <Picker.Item label="Zile lucrătoare" value="weekdays" />
                <Picker.Item label="În fiecare zi" value="everyday" />
              </Picker>
            </View>
            <TouchableOpacity onPress={handleSubmit} style={styles.addTaskButton}>
              <Text style={styles.closeText}>{ typeof index === "undefined" ? "Adauga" : "Salveaza schimbari"}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onClose(false)} style={styles.closeButton}>
              <Text style={styles.closeText}>Anuleaza</Text>
            </TouchableOpacity>
            {typeof index !== "undefined" &&
              <TouchableOpacity onPress={handleDelete} style={styles.closeButton}>
                <Text style={styles.closeText}>Sterge</Text>
              </TouchableOpacity>
            }


          </View>
        </View>
      </ScrollView>
    </Modal>
  );
}

export default AddPopUp;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popup: {
    width: 320,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  inputSmall: {
    width: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 5,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  largeInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  button: {
    padding: 10,
    backgroundColor: '#f1f1f1',
    borderRadius: 5,
    marginHorizontal: 5,
  },
  picker: {
    flex: 1,
    height: 53,
  },
  addTaskButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: 'green',
    borderRadius: 5,
    alignItems: 'center',
  },
  closeButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: 'red',
    borderRadius: 5,
    alignItems: 'center',
  },
  closeText: {
    color: 'white',
    fontWeight: 'bold',
  },
  stepsContainer: {
    marginBottom: 10,
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 15,
  },
  stepInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  addButton: {
    backgroundColor: '#28a745',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  addButtonText: {
    color: 'white',
    fontSize: 18,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: '#f1f1f1',
    borderRadius: 5,
    marginVertical: 5,
  },
  stepText: {
    flex: 1,
  },
  removeButton: {
    color: '#d9534f',
    fontSize: 16,
    marginLeft: 10,
  },
  smallText: {
    fontSize: 13
  },
  arrow: {
    width: 50,
    height: 50,
  },

});
