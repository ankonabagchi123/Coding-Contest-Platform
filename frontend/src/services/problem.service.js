import axiosInstance from "./axiosInstance";

export const fetchProblems = async (params = {}) => {
  const { data } = await axiosInstance.get("/problems", { params });
  return data.data; // { problems, pagination }
};

export const fetchProblemBySlug = async (slug) => {
  const { data } = await axiosInstance.get(`/problems/${slug}`);
  return data.data.problem;
};

export const fetchProblemById = async (id) => {
  const { data } = await axiosInstance.get(`/problems/id/${id}`);
  return data.data.problem;
};