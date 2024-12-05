import axios, { AxiosInstance } from 'axios'
import { IHttpClientProvider } from './IHttpClientProvider'
import { usersService } from '../../services/usersService'
import { HTTP_STATUS_CODE } from '../../models/enums/HttpStatusCode'

export class AxiosHttpClientProvider implements IHttpClientProvider {
  private readonly axiosInstance: AxiosInstance
  private static _instance: AxiosHttpClientProvider | null = null

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3333',
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.axiosInstance.interceptors.request.use(
      (config: any) => {
        const token = usersService.getToken()
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error: any) => {
        return Promise.reject(error)
      },
    )

    this.axiosInstance.interceptors.response.use(
      (config: any) => config,
      async (error: any) => {
        const tokenExpired =
          error?.response?.status === HTTP_STATUS_CODE.UNAUTHORIZED

        if (tokenExpired) {
          try {
            const refreshToken = usersService.getRefreshToken()
            const { data } = await usersService.updateRefreshTokenService(
              refreshToken,
              AxiosHttpClientProvider.getInstance(),
            )

            if (!data.token || !data.refreshToken) {
              throw new Error('Token inválido')
            }

            usersService.setToken(data.token)
            usersService.setRefreshToken(data.refreshToken)

            if (error.config) {
              return this.axiosInstance(error.config)
            }

            return Promise.reject(error)
          } catch (error) {
            usersService.removeToken()
            usersService.removeRefreshToken()
            window.location.href = '/login'
          }
        }

        return Promise.reject(error)
      },
    )
  }

  public static getInstance(): AxiosHttpClientProvider {
    if (!AxiosHttpClientProvider._instance) {
      AxiosHttpClientProvider._instance = new AxiosHttpClientProvider()
    }
    return AxiosHttpClientProvider._instance
  }

  async post(url: string, body?: any, options?: any) {
    try {
      const axiosResponse = await this.axiosInstance.post(url, body, options)
      return {
        data: axiosResponse.data,
      }
    } catch (error: any) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        throw new Error(error.response.data.message)
      }
      throw error
    }
  }

  async put(url: string, body?: any, options?: any) {
    try {
      const axiosResponse = await this.axiosInstance.put(url, body, options)
      return {
        data: axiosResponse.data,
      }
    } catch (error: any) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        throw new Error(error.response.data.message)
      }
      throw error
    }
  }

  async get(url: string, options?: any) {
    try {
      const axiosResponse = await this.axiosInstance.get(url, options)
      return {
        data: axiosResponse.data,
      }
    } catch (error: any) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        throw new Error(error.response.data.message)
      }
      throw error
    }
  }

  async patch(url: string, body?: any, options?: any) {
    try {
      const axiosResponse = await this.axiosInstance.patch(url, body, options)
      return {
        data: axiosResponse.data,
      }
    } catch (error: any) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        throw new Error(error.response.data.message)
      }
      throw error
    }
  }

  async delete(url: string, options?: any) {
    try {
      const axiosResponse = await this.axiosInstance.delete(url, options)
      return {
        data: axiosResponse.data,
      }
    } catch (error: any) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        throw new Error(error.response.data.message)
      }
      throw error
    }
  }
}
