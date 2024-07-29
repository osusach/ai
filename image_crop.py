import cv2
import numpy as np
import os

## CAMBIAR SEGÚN NECESIDAD
wiggle = 20
separator = 5

def extract_columns(image_path, filename, num_columns):
    # Cargar la imagen
    image = cv2.imread(image_path)
    if image is None:
        print(f"Error: No se pudo cargar la imagen desde {image_path}")
        return

    # Obtener las dimensiones de la imagen
    height, width, _ = image.shape

    # Calcular el ancho de cada columna
    column_width = width // num_columns

    # Crear una carpeta para guardar las columnas
    output_folder = 'cols/'+filename+'_crop'
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)

    # Extraer y guardar cada columna
    for i in range(num_columns):
        start_x = i * column_width - int(wiggle*0.5) + (i * separator)
        if start_x < 0:
            start_x = 0
        end_x = (i + 1) * column_width + wiggle + (i * separator)
        column = image[:, start_x:end_x]

        output_path = os.path.join(output_folder, f'column_{i+1}.png')
        cv2.imwrite(output_path, column)
        print(f'Columna {i+1} guardada en {output_path}')


def extract_columns_from_folder(folder_path):
    # Iterar sobre todos los archivos en la carpeta
    filename: str
    for filename in os.listdir(folder_path):
        # Verificar que el archivo sea una imagen
        if filename.lower().endswith(('.png', '.jpg', '.jpeg', '.bmp', '.tiff')):
            # Extraer la cantidad de columnas del nombre del archivo
            num_columns = int(filename.split("_")[1].split(".")[0])
            image_path = os.path.join(folder_path, filename)
            extract_columns(image_path, filename.lower(), num_columns)

extract_columns_from_folder('images')