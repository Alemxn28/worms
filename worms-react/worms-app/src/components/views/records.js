import React, { useState } from 'react';
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// Estilos para el PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#E4E4E4',
    padding: 10
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 20
  }
});

const Records = () => {
  const options = ['Día', 'Semana', 'Mes'];
  const [selectedOption, setSelectedOption] = useState(options[0]);

  const handleSelectOption = (option) => {
    setSelectedOption(option);
  };

  // Componente de documento PDF
  const MyDocument = () => (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.title}>Reporte de Registros - {selectedOption}</Text>
          <Text>Este es el contenido del reporte seleccionado para el período de {selectedOption}.</Text>
          {/* Aquí puedes agregar más contenido dinámico basado en la selección */}
        </View>
      </Page>
    </Document>
  );

  return (
    <main className="bg-white p-4 rounded shadow-lg mt-24 mx-auto w-full lg:w-11/12">
      <div className="flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md p-6 bg-white rounded shadow-md text-center">
          <h2 className="text-2xl font-bold mb-6">Registros</h2>
          <div className="relative w-full mb-8">
            <div className="flex justify-center space-x-4">
              {options.map((option) => (
                <button
                  key={option}
                  className={`text-lg font-medium rounded-full px-4 py-2 transition-all duration-300 ease-in-out ${
                    selectedOption === option ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'
                  }`}
                  onClick={() => handleSelectOption(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
          <PDFDownloadLink
            document={<MyDocument />}
            fileName={`Reporte_${selectedOption}.pdf`}
            className="flex items-center justify-center px-4 py-2 bg-blue-500 text-white font-semibold rounded hover:bg-blue-700 transition-colors duration-300 ease-in-out"
          >
            {({ blob, url, loading, error }) =>
              loading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Cargando documento...
                </div>
              ) : (
                <div className="flex items-center">
                  <svg className="mr-2 -ml-1 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v8m0 0H8m4 0h4m2-12H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2z"></path>
                  </svg>
                  Descargar PDF de Registros
                </div>
              )
            }
          </PDFDownloadLink>

        </div>
      </div>
    </main>
  );
};

export default Records;
