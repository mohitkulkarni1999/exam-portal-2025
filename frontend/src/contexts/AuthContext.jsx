import { createContext, useContext, useReducer, useEffect } from 'react';
import Cookies from 'js-cookie';
import { authAPI } from '../services/api';

const AuthContext = createContext();

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: true,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    case 'RESTORE_SESSION':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const token = Cookies.get('token');
    const user = Cookies.get('user');
    
    if (token && user) {
      try {
        const parsedUser = JSON.parse(user);
        dispatch({
          type: 'RESTORE_SESSION',
          payload: { token, user: parsedUser },
        });
      } catch (error) {
        console.error('Error parsing user data:', error);
        logout();
      }
    } else {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const login = async (email, password, userType = 'student') => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // For demo purposes, simulate different login endpoints
      let endpoint = '/auth/login';
      if (userType === 'admin') {
        endpoint = '/auth/admin/login';
      }
      
      // Mock successful login for demo
      if ((userType === 'admin' && email === 'admin@examportal.com' && password === 'admin123') ||
          (userType === 'student' && email === 'student@examportal.com' && password === 'student123')) {
        
        const userData = {
          id: userType === 'admin' ? 1 : 2,
          email: email,
          name: userType === 'admin' ? 'Admin User' : 'Student User',
          role: userType === 'admin' ? 'ROLE_ADMIN' : 'ROLE_STUDENT',
        };
        
        // Store in cookies
        const mockToken = `mock-${userType}-token-${Date.now()}`;
        
        dispatch({ type: 'LOGIN_SUCCESS', payload: { user: userData, token: mockToken } });
        Cookies.set('token', mockToken, { expires: 7 });
        Cookies.set('refreshToken', `refresh-${mockToken}`, { expires: 30 });
        Cookies.set('user', JSON.stringify(userData), { expires: 7 });
        
        return { success: true };
      }
      
      // Try actual API call
      try {
        const response = await authAPI.login({ email, password });
        
        if (response.data.token) {
          const userData = {
            id: response.data.id,
            email: response.data.email,
            name: response.data.name,
            role: response.data.role,
          };
          
          dispatch({ type: 'LOGIN_SUCCESS', payload: { user: userData, token: response.data.token } });
          
          // Store in cookies
          Cookies.set('token', response.data.token, { expires: 7 });
          Cookies.set('refreshToken', response.data.refreshToken, { expires: 30 });
          Cookies.set('user', JSON.stringify(userData), { expires: 7 });
          
          return { success: true };
        }
      } catch (apiError) {
        console.error('API Login error:', apiError);
        return { 
          success: false, 
          error: apiError.response?.data?.message || 'Invalid credentials' 
        };
      }
      
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: 'Login failed' 
      };
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.registerStudent(userData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Registration failed' 
      };
    }
  };

  const registerAdmin = async (userData) => {
    try {
      // Try actual API call first
      try {
        const response = await authAPI.registerAdmin(userData);
        return { 
          success: true, 
          message: 'Admin account created successfully',
          data: response.data
        };
      } catch (apiError) {
        console.error('Admin registration API error:', apiError);
        return { 
          success: false, 
          error: apiError.response?.data?.message || 'Admin registration failed' 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Admin registration failed' 
      };
    }
  };

  const logout = () => {
    Cookies.remove('token');
    Cookies.remove('refreshToken');
    Cookies.remove('user');
    dispatch({ type: 'LOGOUT' });
  };

  const value = {
    user: state.user,
    loading: state.loading,
    login,
    register,
    registerAdmin,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
