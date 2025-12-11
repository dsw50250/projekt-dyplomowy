import api from "./api";

export const getDevelopers = async () => {
  const res = await api.get("/users/developers");
  return res.data;
};

export const getSkills = async () => {
  const res = await api.get("/skills");
  return res.data;
};
