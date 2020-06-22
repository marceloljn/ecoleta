import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { Map, TileLayer, Marker } from 'react-leaflet';
import { LeafletMouseEvent } from 'leaflet';
import api from '../../services/api';
import axios from 'axios';

import Dropzone from '../../components/Dropzone';

import './styles.css';

import logo from '../../assets/logo.svg';

interface Item {
  id: number;
  title: string;
  image_url: string;
}

interface UF {
  id: number;
  sigla: string;
  nome: string;
}

interface City {
  id: number;
  nome: string;
}

const CreatePoint: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);

  const [formData, setFormData] = useState({ name: '', email: '', whatsapp: '' });

  const [initialPosition, setInitialPosition] = useState<[number, number]>([0, 0]);

  const [ufs, setUfs] = useState<UF[]>([]);
  const [selectedUf, setSelectedUf] = useState('0');
  const [selectedCity, setSelectedCity] = useState('0');
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedPosition, setSelectedPosition] = useState<[number, number]>([0, 0]);
  const [selectedFile, setSelectedFile] = useState<File>();
  const history = useHistory();

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;

      setInitialPosition([latitude, longitude]);
    });
  }, []);

  useEffect(() => {
    api.get('items').then((response) => {
      setItems(response.data);
    });
  }, []);

  useEffect(() => {
    axios.get('https://servicodados.ibge.gov.br/api/v1/localidades/estados').then((response) => {
      setUfs(
        response.data.map((item: UF) => {
          return { id: item.id, sigla: item.sigla, nome: item.nome };
        })
      );
    });
  }, []);

  useEffect(() => {
    if (selectedUf === '0') {
      return;
    }

    axios
      .get(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`)
      .then((response) => {
        setCities(
          response.data.map((item: City) => {
            return { id: item.id, nome: item.nome };
          })
        );
      });
  }, [selectedUf]);

  const handleSelectUf = (event: ChangeEvent<HTMLSelectElement>) => {
    const sigla = event.target.value;

    setSelectedUf(sigla);
  };

  const handleMapClick = (event: LeafletMouseEvent) => {
    setSelectedPosition([event.latlng.lat, event.latlng.lng]);
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectedItem = (id: number) => {
    if (selectedItems.includes(id)) {
      setSelectedItems([...selectedItems.filter((itemId) => itemId !== id)]);
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const { name, email, whatsapp } = formData;
    const uf = selectedUf;
    const city = selectedCity;
    const [latitude, longitude] = selectedPosition;
    const items = selectedItems;

    const data = new FormData();
    data.append('name', name);
    data.append('email', email);
    data.append('whatsapp', whatsapp);
    data.append('uf', uf);
    data.append('city', city);
    data.append('latitude', String(latitude));
    data.append('longitude', String(longitude));
    data.append('items', items.join(','));
    data.append('image', selectedFile ?? '');

    await api.post('points', data);

    alert('Ponto de coleta Criado');
    history.push('/');
  };

  return (
    <div id="page-create-point">
      <div className="content">
        <header>
          <img src={logo} alt="Ecoleta"></img>
          <Link to="/">
            <FiArrowLeft></FiArrowLeft>Voltar para Home
          </Link>
        </header>

        <form onSubmit={handleSubmit}>
          <h1>
            Cadastro do <br />
            ponto de coleta
          </h1>

          <Dropzone onFileUploaded={setSelectedFile}></Dropzone>
          <fieldset>
            <legend>
              <h2>Dados</h2>
            </legend>

            <div className="field">
              <label htmlFor="name">Nome da entidade</label>
              <input type="text" name="name" id="name" onChange={handleInputChange} />
            </div>

            <div className="field-group">
              <div className="field">
                <label htmlFor="email">Email</label>
                <input type="email" name="email" id="email" onChange={handleInputChange} />
              </div>
              <div className="field">
                <label htmlFor="whatsapp">Whatsapp</label>
                <input type="text" name="whatsapp" id="whatsapp" onChange={handleInputChange} />
              </div>
            </div>
          </fieldset>
          <fieldset>
            <legend>
              <h2>Endereço</h2>
              <span>Selecione o endereço do mapa</span>
            </legend>

            <Map center={initialPosition} zoom={15} onClick={handleMapClick}>
              <TileLayer
                attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={selectedPosition} />
            </Map>

            <div className="field-group">
              <div className="field">
                <label htmlFor="uf">Estado (UF)</label>
                <select name="uf" id="uf" value={selectedUf} onChange={(e) => handleSelectUf(e)}>
                  <option value="0">Selecione uma UF</option>
                  {ufs.map((uf) => (
                    <option key={uf.id} value={uf.sigla}>
                      {uf.nome}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="city">Cidade</label>
                <select name="city" id="city" value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)}>
                  <option value="0">Selecione uma Cidade</option>
                  {cities.map((city) => (
                    <option key={city.id} value={city.nome}>
                      {city.nome}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </fieldset>
          <fieldset>
            <legend>
              <h2>Ítens de coletas</h2>
              <span>Selecione um ou mais ítens abaixo</span>
            </legend>
            <ul className="items-grid">
              {items.map((item) => (
                <li
                  key={item.id}
                  onClick={() => handleSelectedItem(item.id)}
                  className={selectedItems.includes(item.id) ? 'selected' : ''}
                >
                  <img src={item.image_url} alt={item.title} />
                  <span>{item.title}</span>
                </li>
              ))}
            </ul>
          </fieldset>
          <button type="submit">Cadastrar ponto de coleta</button>
        </form>
      </div>
    </div>
  );
};

export default CreatePoint;
