import authConfig from "../../../../config/auth";
import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../createUser/ICreateUserDTO";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

let usersRepositoryInMemory: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;

describe("Authenticate user", () => {
  beforeEach(() => {
    authConfig.jwt.secret = "335cd5e290807fd304c6b635e7cb0c5c";
    usersRepositoryInMemory = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
    authenticateUserUseCase = new AuthenticateUserUseCase(
      usersRepositoryInMemory
    );
  });

  it("Should be able to authenticate an user", async () => {
    const user: ICreateUserDTO = {
      name: "Test User",
      email: "test@test.com",
      password: "12345678",
    };

    await createUserUseCase.execute(user);

    const auth = await authenticateUserUseCase.execute({
      email: user.email,
      password: "12345678",
    });

    expect(auth.user).toHaveProperty("email", user.email);
    expect(auth).toHaveProperty("token");
  });

  it("Should not be able to authenticate an unexistent user", async () => {
    await expect(
      authenticateUserUseCase.execute({
        email: "user@test.com",
        password: "12345678",
      })
    ).rejects.toEqual(new IncorrectEmailOrPasswordError());
  });

  it("Should not be able to authenticate an user with an incorrect password", async () => {
    const user: ICreateUserDTO = {
      name: "Test User",
      email: "test@test.com",
      password: "12345678",
    };

    await createUserUseCase.execute(user);

    await expect(
      authenticateUserUseCase.execute({
        email: user.email,
        password: "wrong password",
      })
    ).rejects.toEqual(new IncorrectEmailOrPasswordError());
  });
});
