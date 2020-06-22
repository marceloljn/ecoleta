import React, { useState, useEffect } from 'react';
import { Feather as Icon } from '@expo/vector-icons';
import { View, ImageBackground, Text, Image, StyleSheet, Alert } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import RNPickerSelect from 'react-native-picker-select';
import axios from 'axios';

interface UF {
  label: string;
  value: string;
}

interface City {
  label: string;
  value: string;
}

const Home = () => {
  const [ufs, setUfs] = useState<UF[]>([]);
  const [selectedUf, setSelectedUf] = useState('0');
  const [selectedCity, setSelectedCity] = useState('0');
  const [cities, setCities] = useState<City[]>([]);
  const navigation = useNavigation();

  const handleSelectUf = (sigla: string) => {
    console.log(`Estado Selecionado: ${sigla}`);
    setSelectedUf(sigla);
  };

  const handleSelectCity = (nome: string) => {
    console.log(`Cidade Selecionada: ${nome}`);
    setSelectedCity(nome);
  };

  const handleNavigateToPoints = () => {
    if (selectedUf === '0' || selectedCity === '0') {
      Alert.alert('Selecione um Estado e uma Cidade');
      return;
    }
    navigation.navigate('Points', { uf: selectedUf, city: selectedCity });
  };

  useEffect(() => {
    axios.get('https://servicodados.ibge.gov.br/api/v1/localidades/estados').then((response) => {
      setUfs(
        response.data.map((item: any) => {
          return { label: item.nome, value: item.sigla };
        })
      );
    });
  }, []);

  useEffect(() => {
    if (selectedUf === '0') {
      return;
    }

    console.log(`Repopulando cidades pelo estado: ${selectedUf}`);
    axios
      .get(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`)
      .then((response) => {
        setCities(
          response.data.map((item: any) => {
            return { label: item.nome, value: item.nome };
          })
        );
      });
  }, [selectedUf]);

  return (
    <>
      <ImageBackground
        source={require('../../assets/home-background.png')}
        imageStyle={{ width: 274, height: 368 }}
        style={styles.container}
      >
        <View style={styles.main}>
          <Image source={require('../../assets/logo.png')} />
          <View>
            <Text style={styles.title}>Seu marketplace de coleta de resíduos</Text>
            <Text style={styles.description}>Ajudamos pessoas a encontrarem pontos de coleta de forma eficiente.</Text>
          </View>
        </View>
        <View style={styles.footer}>
          {/* <TextInput style={styles.input} placeholder="Digite a UF" /> */}
          <RNPickerSelect
            style={styles}
            onValueChange={(value) => handleSelectUf(value)}
            placeholder={{ label: 'Selecione um Estado', value: '0' }}
            items={ufs}
          />
          <RNPickerSelect
            style={styles}
            onValueChange={(value) => handleSelectCity(value)}
            placeholder={{ label: 'Selecione uma Cidade', value: '0' }}
            items={cities}
          />
          <RectButton style={styles.button} onPress={handleNavigateToPoints}>
            <View style={styles.buttonIcon}>
              <Text>
                <Icon name="arrow-right" color="#FFF" size={24}></Icon>
              </Text>
            </View>
            <Text style={styles.buttonText}>Entrar</Text>
          </RectButton>
        </View>
      </ImageBackground>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 32,
  },

  main: {
    flex: 1,
    justifyContent: 'center',
  },

  title: {
    color: '#322153',
    fontSize: 32,
    fontFamily: 'Ubuntu_700Bold',
    maxWidth: 260,
    marginTop: 64,
  },

  description: {
    color: '#6C6C80',
    fontSize: 16,
    marginTop: 16,
    fontFamily: 'Roboto_400Regular',
    maxWidth: 260,
    lineHeight: 24,
  },

  footer: {},

  select: {},

  input: {
    height: 60,
    backgroundColor: '#FFF',
    borderRadius: 10,
    marginBottom: 8,
    paddingHorizontal: 24,
    fontSize: 16,
  },

  button: {
    backgroundColor: '#34CB79',
    height: 60,
    flexDirection: 'row',
    borderRadius: 10,
    overflow: 'hidden',
    alignItems: 'center',
    marginTop: 8,
  },

  buttonIcon: {
    height: 60,
    width: 60,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  buttonText: {
    flex: 1,
    justifyContent: 'center',
    textAlign: 'center',
    color: '#FFF',
    fontFamily: 'Roboto_500Medium',
    fontSize: 16,
  },
  inputIOS: {
    height: 60,
    backgroundColor: '#FFF',
    borderRadius: 10,
    marginBottom: 8,
    paddingHorizontal: 24,
    fontSize: 16,
    paddingRight: 30, // to ensure the text is never behind the icon
  },
  inputAndroid: {
    height: 60,
    backgroundColor: '#FFF',
    borderRadius: 10,
    marginBottom: 8,
    paddingHorizontal: 24,
    fontSize: 16,
    paddingRight: 30, // to ensure the text is never behind the icon
  },
});

export default Home;
