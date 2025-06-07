import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/client';
import { 
  GET_UNIDAD_MEDIDA, 
  CREATE_UNIDAD_MEDIDA, 
  UPDATE_UNIDAD_MEDIDA,
  GET_UNIDADES_MEDIDA 
} from '../../graphql/unidadesMedida';
import { toast } from 'react-toastify';

export function UnidadMedidaForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    nombre: '',
    abreviatura: ''
  });

  const { data: unidadData, loading: loadingUnidad } = useQuery(GET_UNIDAD_MEDIDA, {
    variables: { id },
    skip: !isEditing,
    onError: (error) => {
      toast.error(`Error al cargar la unidad de medida: ${error.message}`);
      navigate('/app/unidades-medida');
    }
  });

  const [crearUnidadMedida] = useMutation(CREATE_UNIDAD_MEDIDA, {
    onCompleted: () => {
      toast.success('Unidad de medida creada correctamente');
      navigate('/app/unidades-medida');
    },
    onError: (error) => {
      toast.error(`Error al crear unidad de medida: ${error.message}`);
    },
    refetchQueries: [{ query: GET_UNIDADES_MEDIDA }]
  });

  const [actualizarUnidadMedida] = useMutation(UPDATE_UNIDAD_MEDIDA, {
    onCompleted: () => {
      toast.success('Unidad de medida actualizada correctamente');
      navigate('/app/unidades-medida');
    },
    onError: (error) => {
      toast.error(`Error al actualizar unidad de medida: ${error.message}`);
    },
    refetchQueries: [{ query: GET_UNIDADES_MEDIDA }]
  });

  useEffect(() => {
    if (unidadData?.unidadMedida) {
      setFormData({
        nombre: unidadData.unidadMedida.nombre,
        abreviatura: unidadData.unidadMedida.abreviatura
      });
    }
  }, [unidadData]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nombre.trim() || !formData.abreviatura.trim()) {
      toast.error('Todos los campos son obligatorios');
      return;
    }

    const variables = {
      nombre: formData.nombre.trim(),
      abreviatura: formData.abreviatura.trim()
    };

    try {
      if (isEditing) {
        await actualizarUnidadMedida({
          variables: {
            id,
            ...variables
          }
        });
      } else {
        await crearUnidadMedida({
          variables
        });
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loadingUnidad) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-lg p-6 mx-auto bg-white rounded-lg shadow">
      <h2 className="mb-6 text-2xl font-bold text-gray-900">
        {isEditing ? 'Editar' : 'Nueva'} Unidad de Medida
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Nombre *
          </label>
          <input
            type="text"
            value={formData.nombre}
            onChange={(e) => handleChange('nombre', e.target.value)}
            placeholder="Ej: Kilogramo"
            className="block w-full px-4 py-3 mt-1 text-base border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Abreviatura *
          </label>
          <input
            type="text"
            value={formData.abreviatura}
            onChange={(e) => handleChange('abreviatura', e.target.value)}
            placeholder="Ej: kg"
            className="block w-full px-4 py-3 mt-1 text-base border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          <p className="mt-1 text-sm text-gray-500">
            Ingrese una abreviatura corta y clara para la unidad de medida
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => navigate('/app/unidades-medida')}
            className="px-6 py-3 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-6 py-3 text-base font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {isEditing ? 'Actualizar' : 'Crear'}
          </button>
        </div>
      </form>
    </div>
  );
} 