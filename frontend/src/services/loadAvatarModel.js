import { Live2DModel } from "pixi-live2d-display/cubism4";

export const loadAvatarModel = async () => {
    try {
        //model = await Live2DModel.from("/models/Rice/Rice.model3.json");
        const model = await Live2DModel.from("/models/Hiyori/Hiyori.model3.json");
        //model = await Live2DModel.from("/models/Hiyori/Hiyori.model3.json");
        //model = await Live2DModel.from("/models/Hiyori/Hiyori.model3.json");
        return model;
      } catch (err) {
        // El error de red (Network error) ocurre si el componente se desmonta 
        // mientras se está descargando el archivo y el navegador cancela la petición.
        //if (isMounted) console.error("Error al cargar el modelo:", err);
        console.error("Error al cargar el modelo:", err);
        return null;
      }
}