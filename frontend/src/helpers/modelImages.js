export function getDefaultProfileImage(modelId) {
  return `/assets/img/profiles/${modelId?.toLowerCase() || "hiyori"}_profile.png`;
}
