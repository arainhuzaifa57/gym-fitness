import axios from "axios";

const apiUrl = "https://fitgress-backend.vercel.app";

const dataVerbs = ["POST", "PUT", "DELETE"];

const defaultConfig = {
  authenticate: true,
  silent: false,
  token: true,
};

export default class APIServiceManager {
  constructor(config) {
    this.config = {
      ...defaultConfig,
      ...config,
    };
    this.primaryHeader = {
      Accept: "application/json",
    };
    if (this.config.authenticate) {
      this.primaryHeader["Content-Type"] = "application/json";
    }
  }

  request = async (
    method,
    route,
    data = {},
    additionalHeaders = {},
    timeout
  ) => {
    return new Promise((resolve, reject) => {
      let apiCall;
      route = this.clean(route);
      method = method.toUpperCase();
      const value = dataVerbs.indexOf(method);
      switch (value) {
        case 0:
          console.log("Post ROUTE", apiUrl + "/" + route);
          apiCall = axios(apiUrl + "/" + route, {
            method: "post",
            headers: {
              ...this.primaryHeader,
              ...additionalHeaders,
            },
            data: data,
            timeout: timeout ? timeout : 10000,
          });
          break;
        case 1:
          apiCall = axios(apiUrl + "/" + route, {
            method: "PUT",
            headers: {
              ...this.primaryHeader,
              ...additionalHeaders,
            },
            data: data,
            timeout: timeout ? timeout : 10000,
          });
          break;

        case 2:
          console.log("Delete ROUTE", apiUrl + "/" + route);
          apiCall = axios(apiUrl + "/" + route, {
            method: "DELETE",
            headers: {
              ...this.primaryHeader,
              ...additionalHeaders,
            },
            data: data,
          });
        default:
          console.log("Get ROUTE", apiUrl + "/" + route);
          apiCall = axios(apiUrl + "/" + route, {
            method,
            headers: {
              ...this.primaryHeader,
              ...additionalHeaders,
            },
            params: data,
          });
          break;
      }
      apiCall
        .then((response) => {
          resolve(response);
        })
        .catch((error) => {
          console.log("error in service", error);
          if (error.response) {
            if (error.response.status === 400) {
              reject({
                error: error?.response?.data?.message,
                code: error.response.status,
                offline: false,
              });
              return;
            }
            if (error.response.status === 401) {
              reject({
                error: error?.response?.data?.message,
                code: error.response.status,
                offline: false,
              });
              return;
            }
            if (error.response.status === 404) {
              reject({
                error: error?.response?.data?.message,
                code: error.response.status,
                offline: false,
              });
              return;
            }
            if (error.response.status === 500) {
              reject({
                error: error?.response?.data?.message,
                code: error.response.status,
                offline: false,
              });
              return;
            }
            if (error.response.status === 401) {
              reject({
                error: error?.response?.data?.message,
                code: error.response.status,
                offline: false,
              });
              return;
            }
            console.log("this.config.silent");
            if (!this.config.silent) {
              if (
                error.response.status === 422 &&
                typeof error.response.data.message !== "undefined"
              ) {
                error = error.response.data.error;
              }
              reject({
                error: error?.response?.data?.message,
                code: error.response.status,
                offline: false,
              });
            }
          } else {
            reject({
              error: "Oops! No Internet Connection",
              code: 500,
            });
          }
        });

      return this;
    });
  };

  clean = (urlSegment) => {
    urlSegment = urlSegment.endsWith("/")
      ? urlSegment.slice(0, -1)
      : urlSegment;
    urlSegment = urlSegment.startsWith("/") ? urlSegment.slice(1) : urlSegment;
    return urlSegment;
  };
}
