/* Configures the Cloudinary Client */
import cloudinary from "cloudinary";

// Cloudinary API configs
cloudinary.v2.config({
  cloud_name: "dsqw5kd59",
  api_key: "776857344324132",
  api_secret: "cNO50ceR5k3YJrR7c4WQZq5ZQKE",
  secure: true
});

export default cloudinary;