"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = void 0;
const google_auth_library_1 = require("google-auth-library");
const user_repository_1 = require("../repositores/user.repository");
const encript_password_1 = require("../utils/encript.password");
const response_1 = require("../utils/response");
const token_1 = require("../utils/token");
const email_1 = require("../utils/email");
exports.auth = {
    vefifyAccountRegistration: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { hash } = req.params;
        try {
            const userFound = yield user_repository_1.userRepository.findOneByhash(hash);
            if (!userFound)
                return (0, response_1.unSuccesfulResponse)(res, { error: 'invalid hash' });
            userFound.isValidated = true;
            yield userFound.save();
            res.status(200).send('<h3>Your account had been validated</h3>');
        }
        catch (error) {
            (0, response_1.unSuccesfulResponse)(res);
        }
    }),
    signInRegular: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { email, password } = req.body;
        try {
            const userFound = yield user_repository_1.userRepository.findOneByEmail(email);
            if (!userFound) {
                return (0, response_1.unSuccesfulResponse)(res, { error: 'user or password incorrect' }, 400);
            }
            if (!(0, encript_password_1.compoarePassword)(password, userFound.password)) {
                return (0, response_1.unSuccesfulResponse)(res, { error: 'user or password incorrect' }, 400);
            }
            const token = (0, token_1.genToken)({ _id: userFound._id });
            userFound.password = '';
            console.log(userFound);
            (0, response_1.succesfulResponse)(res, { token, user: userFound });
        }
        catch (error) {
            console.log(token_1.genToken);
        }
    }),
    googleAuth: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const client = new google_auth_library_1.OAuth2Client(process.env.CLIENT_ID);
        const token = req.headers.xgtoken;
        try {
            const ticket = yield client.verifyIdToken({
                idToken: String(token),
                audience: process.env.CLIENT_ID
            });
            const { aud, email, email_verified, picture, family_name, given_name } = ticket.getPayload();
            // console.log(payload);
            // If request specified a G Suite domain:
            // const domain = payload['hd'];
            if (process.env.CLIENT_ID !== aud)
                return (0, response_1.unSuccesfulResponse)(res, { err: 'error on sign in' }, 400);
            req.body.email = email;
            req.body.emailVerified = email_verified;
            req.body.picture = picture;
            req.body.lastname = family_name;
            req.body.name = given_name;
            req.body.password = '12345678Google';
            req.body.isGoogle = true;
            req.body.isValidated = true;
            // req.body.picture = picture;
        }
        catch (error) {
            console.log(error);
            (0, response_1.unSuccesfulResponse)(res);
        }
        next();
    }),
    /**
     * @description create a new user, data comes from the middlaware that evaluetes google auth
     * @param req
     * @param res
     * @returns
     */
    saveAndAuth: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { name, lastname, email, password, isGoogle, picture } = req.body;
        const currentUser = req.body.currentUser;
        let nUser = { name, lastname, email, password, isGoogle, picture, state: true, isValidated: true, lastSignIn: undefined, rol: 'regular', hash: '', isConnected: false };
        try {
            if (!currentUser) {
                const newUser = yield user_repository_1.userRepository.save(nUser);
                const token = (0, token_1.genToken)({ _id: newUser._id });
                (0, response_1.succesfulResponse)(res, { user: newUser, token });
            }
            else if (!currentUser.isGoogle) {
                return (0, response_1.unSuccesfulResponse)(res, { error: 'Sign in with user and password' });
            }
            else {
                const token = (0, token_1.genToken)({ _id: currentUser._id });
                (0, response_1.succesfulResponse)(res, { user: currentUser, token });
            }
        }
        catch (error) {
            console.log(error);
            (0, response_1.unSuccesfulResponse)(res);
        }
    }),
    logInWithToken: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { _id } = req.params;
        try {
            const user = yield user_repository_1.userRepository.findOneById(_id);
            const token = (0, token_1.genToken)({ _id: user._id });
            (0, response_1.succesfulResponse)(res, { user, token });
        }
        catch (error) {
            console.log(error);
            (0, response_1.unSuccesfulResponse)(res);
        }
    }),
    sendValidationLink: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { email } = req.body;
        try {
            const userFound = yield user_repository_1.userRepository.findOneByEmail(email);
            if (userFound) {
                yield (0, email_1.emailValidationAccount)(userFound.hash, userFound.email);
                return (0, response_1.succesfulResponse)(res, { email });
            }
            (0, response_1.unSuccesfulResponse)(res, { error: 'email no found' });
        }
        catch (error) {
            (0, response_1.unSuccesfulResponse)(res);
        }
    })
};
