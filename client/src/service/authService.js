class AuthService {
  constructor({ config, validators }) {
    this.config = config;
    this.validators = validators;

    if (typeof sessionStorage !== 'undefined') {
      this.store = sessionStorage;
    } else {

      this.store = {
        storage: {},

        setItem: (key, value) => {
          this.store.storage[key] = value;
        },
        getItem: (key) => {
          return this.store.storage[key];
        },
        clear: () => {
          this.store.storage = {};
        }
      };
    }

  }

  _validateStringField(field, value) {
    if (typeof value !== 'string' || !value.trim().length) throw Error(`${field} is not valid`);
  }

  _validateEmail(email) {
    const validateEmail = this.validators.get('validateEmail');

    if (!validateEmail(email)) throw Error(`${email} is not a valid email`);
  }

  _userId(userId) {
    if (typeof userId !== 'undefined') {
      this.store.setItem('userId', userId);

      return;
    }

    return this.store.getItem('userId');
  }

  _token(token) {
    if (typeof token !== 'undefined') {
      this.store.setItem('token', token);

      return;
    }

    return this.store.getItem('token');
  }

  isLoggedIn() {
    const res = !!(this._userId() && this._token());

    return res;
  }

  register(name, email, password) {
    return Promise.resolve().then(() => {
      this._validateStringField('name', name);
      this._validateEmail(email);
      this._validateStringField('password', password);

      return fetch(`${this.config.get('API_URL')}/register`, {
          method: 'POST',
          body: JSON.stringify({ name, email, password }),
          headers: {
            'content-type': 'application/json'
          }
        })
        .then(res => {
          if (res.status === 201) {
            return res;
          }

          return res.json().then(({ message }) => {
            throw Error(message);
          });
        })
        .then(res => res.json())
        .then(() => true);
    });
  }

  login(email, password) {
    const API_URL = this.config.get('API_URL');

    if (this.isLoggedIn()) return Promise.resolve().then(() => true);

    return Promise.resolve().then(() => {
      this._validateEmail(email);
      this._validateStringField('password', password);

      return fetch(`${API_URL}/authenticate`, {
          method: 'POST',
          body: JSON.stringify({ email, password }),
          headers: {
            'content-type': 'application/json'
          }
        })
        .then(res => {
          if (res.status === 200) {
            return res;
          }

          return res.json().then(({ message }) => {
            throw Error(message);
          });
        })
        .then(res => res.json())
        .then(({ token, user }) => {
          this._token(token);
          this._userId(user.id);

          return true;
        });
    });
  }

  logout() {
    return Promise.resolve().then(() => {
      delete this.token;
      delete this.userId;

      this.store.clear();
    });
  }

  retrieveUser() {
    const API_URL = this.config.get('API_URL');

    return fetch(`${API_URL}/user/${this._userId()}`, {
        method: 'GET',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${this._token()}`
        }
      })
      .then(res => {
        if (res.status === 200) {
          return res;
        }

        return res.json().then(({ message }) => {
          throw Error(message);
        });
      })
      .then(res => res.json())
      .then(({ user }) => user);
  }
}


export default AuthService;