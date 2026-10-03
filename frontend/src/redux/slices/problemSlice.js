import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchProblems,
  fetchProblemBySlug,
} from "../../services/problem.service";

// --- Thunks ---
export const getProblems = createAsyncThunk(
  "problems/list",
  async (params, { rejectWithValue }) => {
    try {
      return await fetchProblems(params);
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to load problems"
      );
    }
  }
);

export const getProblemBySlug = createAsyncThunk(
  "problems/detail",
  async (slug, { rejectWithValue }) => {
    try {
      return await fetchProblemBySlug(slug);
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to load problem"
      );
    }
  }
);

const initialState = {
  list: [],
  pagination: { total: 0, page: 1, limit: 20, pages: 0 },
  listLoading: false,
  listError: null,

  current: null,
  detailLoading: false,
  detailError: null,

  filters: {
    search: "",
    difficulty: "",
    tags: "",
    page: 1,
    limit: 12,
  },
};

const problemSlice = createSlice({
  name: "problems",
  initialState,
  reducers: {
    setFilter: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      // Reset to page 1 on filter change unless page itself is the change
      if (!("page" in action.payload)) {
        state.filters.page = 1;
      }
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
    clearCurrent: (state) => {
      state.current = null;
      state.detailError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getProblems.pending, (state) => {
        state.listLoading = true;
        state.listError = null;
      })
      .addCase(getProblems.fulfilled, (state, action) => {
        state.listLoading = false;
        state.list = action.payload.problems;
        state.pagination = action.payload.pagination;
      })
      .addCase(getProblems.rejected, (state, action) => {
        state.listLoading = false;
        state.listError = action.payload;
      })
      .addCase(getProblemBySlug.pending, (state) => {
        state.detailLoading = true;
        state.detailError = null;
      })
      .addCase(getProblemBySlug.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.current = action.payload;
      })
      .addCase(getProblemBySlug.rejected, (state, action) => {
        state.detailLoading = false;
        state.detailError = action.payload;
      });
  },
});

export const { setFilter, resetFilters, clearCurrent } = problemSlice.actions;
export default problemSlice.reducer;