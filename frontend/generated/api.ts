/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface CreateUserDto {
  /**
   * User email address
   * @example "user@example.com"
   */
  email: string;
  /**
   * User password
   * @example "password123"
   */
  password?: string;
  /**
   * User first name
   * @example "John"
   */
  firstName?: string;
  /**
   * User last name
   * @example "Doe"
   */
  lastName?: string;
  /** @default "user" */
  role?: "admin" | "user";
  /** @default "local" */
  provider?: "local" | "google";
  /** @example "https://example.com/avatar.jpg" */
  pictureUrl?: string;
  /**
   * Google account ID
   * @example "1234567890"
   */
  googleId?: string;
}

export interface User {
  email: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  /** @default "user" */
  role: "admin" | "user";
  /** Google account ID (sub) */
  googleId?: string;
  pictureUrl?: string;
  provider?: "local" | "google";
}

export interface ErrorResponse {
  /** error status code */
  statusCode: number;
  /** error message */
  message: string;
}

export interface UpdateUserDto {
  /**
   * User email address
   * @example "user@example.com"
   */
  email?: string;
  /**
   * User password
   * @example "password123"
   */
  password?: string;
  /**
   * User first name
   * @example "John"
   */
  firstName?: string;
  /**
   * User last name
   * @example "Doe"
   */
  lastName?: string;
  /** @default "user" */
  role?: "admin" | "user";
  /** @default "local" */
  provider?: "local" | "google";
  /** @example "https://example.com/avatar.jpg" */
  pictureUrl?: string;
  /**
   * Google account ID
   * @example "1234567890"
   */
  googleId?: string;
}

export interface CredentialResponseDto {
  /**
   * Google ID token (JWT) returned by Google One Tap / OAuth
   * @example "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
   */
  credential: string;
}

export interface GoogleLoginDto {
  credentialResponse: CredentialResponseDto;
}

export interface JwtTokensResponse {
  /** access token */
  accessToken: string;
  /** refresh token */
  refreshToken: string;
}

import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  HeadersDefaults,
  ResponseType,
} from "axios";
import axios from "axios";

export type QueryParamsType = Record<string | number, any>;

export interface FullRequestParams
  extends Omit<AxiosRequestConfig, "data" | "params" | "url" | "responseType"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseType;
  /** request body */
  body?: unknown;
}

export type RequestParams = Omit<
  FullRequestParams,
  "body" | "method" | "query" | "path"
>;

export interface ApiConfig<SecurityDataType = unknown>
  extends Omit<AxiosRequestConfig, "data" | "cancelToken"> {
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<AxiosRequestConfig | void> | AxiosRequestConfig | void;
  secure?: boolean;
  format?: ResponseType;
}

export enum ContentType {
  Json = "application/json",
  JsonApi = "application/vnd.api+json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public instance: AxiosInstance;
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private secure?: boolean;
  private format?: ResponseType;

  constructor({
    securityWorker,
    secure,
    format,
    ...axiosConfig
  }: ApiConfig<SecurityDataType> = {}) {
    this.instance = axios.create({
      ...axiosConfig,
      baseURL: axiosConfig.baseURL || "",
    });
    this.secure = secure;
    this.format = format;
    this.securityWorker = securityWorker;
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected mergeRequestParams(
    params1: AxiosRequestConfig,
    params2?: AxiosRequestConfig,
  ): AxiosRequestConfig {
    const method = params1.method || (params2 && params2.method);

    return {
      ...this.instance.defaults,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...((method &&
          this.instance.defaults.headers[
            method.toLowerCase() as keyof HeadersDefaults
          ]) ||
          {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected stringifyFormItem(formItem: unknown) {
    if (typeof formItem === "object" && formItem !== null) {
      return JSON.stringify(formItem);
    } else {
      return `${formItem}`;
    }
  }

  protected createFormData(input: Record<string, unknown>): FormData {
    if (input instanceof FormData) {
      return input;
    }
    return Object.keys(input || {}).reduce((formData, key) => {
      const property = input[key];
      const propertyContent: any[] =
        property instanceof Array ? property : [property];

      for (const formItem of propertyContent) {
        const isFileType = formItem instanceof Blob || formItem instanceof File;
        formData.append(
          key,
          isFileType ? formItem : this.stringifyFormItem(formItem),
        );
      }

      return formData;
    }, new FormData());
  }

  public request = async <T = any, _E = any>({
    secure,
    path,
    type,
    query,
    format,
    body,
    ...params
  }: FullRequestParams): Promise<AxiosResponse<T>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const responseFormat = format || this.format || undefined;

    if (
      type === ContentType.FormData &&
      body &&
      body !== null &&
      typeof body === "object"
    ) {
      body = this.createFormData(body as Record<string, unknown>);
    }

    if (
      type === ContentType.Text &&
      body &&
      body !== null &&
      typeof body !== "string"
    ) {
      body = JSON.stringify(body);
    }

    return this.instance.request({
      ...requestParams,
      headers: {
        ...(requestParams.headers || {}),
        ...(type ? { "Content-Type": type } : {}),
      },
      params: query,
      responseType: responseFormat,
      data: body,
      url: path,
    });
  };
}

/**
 * @title API Documentation
 * @version 1.0
 * @contact
 */
export class Api<
  SecurityDataType extends unknown,
> extends HttpClient<SecurityDataType> {
  app = {
    /**
     * No description
     *
     * @tags App
     * @name GetTest
     * @request GET:/api
     */
    getTest: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api`,
        method: "GET",
        ...params,
      }),
  };
  users = {
    /**
     * No description
     *
     * @tags users
     * @name Create
     * @request POST:/api/users
     */
    create: (data: CreateUserDto, params: RequestParams = {}) =>
      this.request<User, ErrorResponse>({
        path: `/api/users`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags users
     * @name FindAll
     * @request GET:/api/users
     */
    findAll: (params: RequestParams = {}) =>
      this.request<User[], ErrorResponse>({
        path: `/api/users`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags users
     * @name GetCurrentUser
     * @request GET:/api/users/me
     * @secure
     */
    getCurrentUser: (params: RequestParams = {}) =>
      this.request<User, ErrorResponse>({
        path: `/api/users/me`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags users
     * @name FindOne
     * @request GET:/api/users/{id}
     */
    findOne: (id: number, params: RequestParams = {}) =>
      this.request<User, ErrorResponse>({
        path: `/api/users/${id}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags users
     * @name Update
     * @request PATCH:/api/users/{id}
     */
    update: (id: number, data: UpdateUserDto, params: RequestParams = {}) =>
      this.request<User, ErrorResponse>({
        path: `/api/users/${id}`,
        method: "PATCH",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags users
     * @name Delete
     * @request DELETE:/api/users/{id}
     */
    delete: (id: number, params: RequestParams = {}) =>
      this.request<void, ErrorResponse>({
        path: `/api/users/${id}`,
        method: "DELETE",
        ...params,
      }),
  };
  auth = {
    /**
     * No description
     *
     * @tags auth
     * @name GoogleLogin
     * @summary Login with Google
     * @request POST:/api/auth/google/login
     */
    googleLogin: (data: GoogleLoginDto, params: RequestParams = {}) =>
      this.request<JwtTokensResponse, ErrorResponse>({
        path: `/api/auth/google/login`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags auth
     * @name Refresh
     * @summary Refresh access token
     * @request POST:/api/auth/refresh
     */
    refresh: (params: RequestParams = {}) =>
      this.request<JwtTokensResponse, ErrorResponse>({
        path: `/api/auth/refresh`,
        method: "POST",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags auth
     * @name Logout
     * @summary Logout (clear refresh token)
     * @request POST:/api/auth/logout
     */
    logout: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/auth/logout`,
        method: "POST",
        ...params,
      }),
  };
}
