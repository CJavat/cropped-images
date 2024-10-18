import fs from "fs";
import path from "path";
import sharp from "sharp";
import inquirer from "inquirer";

// Definir las coordenadas y el tamaño del recorte
interface CropOptions {
  width: number;
  height: number;
  x: number;
  y: number;
}

// Ruta de la carpeta de entrada y salida
const inputDir: string = path.join(__dirname, "../images");
const outputDir: string = path.join(__dirname, "../cropped-images");

inquirer
  .prompt([
    {
      type: "number",
      name: "coordX",
      message: "Escribe en el eje X desde donde empezar a cortar (EN PX): ",
    },
  ])
  .then(({ coordX }) => {
    // Dimensiones y coordenadas para el recorte
    const cropOptions: CropOptions = {
      width: 600, // Ancho del recorte
      height: 600, // Alto del recorte
      x: coordX, // Coordenada X de inicio del recorte
      y: 0, // Coordenada Y de inicio del recorte
    };

    // Asegurarse de que la carpeta de salida existe
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }

    // Función para recortar imágenes
    const cropImage = async (
      inputPath: string,
      outputPath: string,
      options: CropOptions
    ): Promise<void> => {
      try {
        await sharp(inputPath)
          .extract({
            width: options.width,
            height: options.height,
            left: options.x,
            top: options.y,
          })
          .toFile(outputPath);
        console.log(`Imagen recortada guardada: ${outputPath}`);
      } catch (error) {
        console.error(`Error recortando la imagen ${inputPath}:`, error);
      }
    };

    // Leer todos los archivos de la carpeta de imágenes
    fs.readdir(inputDir, (err, files) => {
      if (err) {
        console.error("Error leyendo la carpeta de imágenes:", err);
        return;
      }

      // Filtrar solo archivos de imagen
      const imageFiles = files.filter((file) =>
        /\.(jpg|jpeg|png)$/i.test(file)
      );

      imageFiles.forEach((file) => {
        const imageExtension = file.split(".").at(-1);
        const fileWithoutExtension = file.split(".").at(0);

        if (!fileWithoutExtension) return;

        const newName =
          cropOptions.x === 0
            ? fileWithoutExtension.split("-").at(0)
            : fileWithoutExtension.split("-").at(1);
        const inputPath = path.join(inputDir, file);
        const outputPath = path.join(outputDir, `${newName}.${imageExtension}`);

        // Llamar a la función para recortar la imagen
        cropImage(inputPath, outputPath, cropOptions);
      });
    });
  })
  .catch((err) => console.log(err));
