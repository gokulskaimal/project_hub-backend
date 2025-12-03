import "reflect-metadata";
import { container } from "../infrastructure/container/Container";
import { TYPES } from "../infrastructure/container/types";
import { CreatePlanUseCase } from "../application/useCase/CreatePlanUseCase";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const plans = [
  {
    name: "Starter",
    description: "For individuals and small projects",
    price: 1,
    currency: "INR",
    type: "STARTER",
    features: ["Unlimited projects", "Kanban & timeline", "Basic integrations"],
    limits: { projects: 10, members: 5, storage: 1 },
    isActive: true,
  },
  {
    name: "Team",
    description: "Best for growing teams",
    price: 999, // Example price
    currency: "INR",
    type: "PRO",
    features: ["Everything in Starter", "Advanced reports", "Priority support"],
    limits: { projects: 100, members: 20, storage: 10 },
    isActive: true,
  },
  {
    name: "Business",
    description: "For large orgs and compliance",
    price: 4999, // Example price
    currency: "INR",
    type: "ENTERPRISE",
    features: ["SSO & role-based access", "Custom workflows", "Uptime SLA"],
    limits: { projects: 1000, members: 100, storage: 100 },
    isActive: true,
  },
];

async function seedPlans() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log("Connected.");

    const createPlanUseCase = container.get<CreatePlanUseCase>(
      TYPES.ICreatePlanUseCase,
    );

    for (const plan of plans) {
      console.log(`Creating plan: ${plan.name}...`);
      // @ts-expect-error plan object structure matches expected input type
      await createPlanUseCase.execute(plan);
      console.log(`Plan ${plan.name} created.`);
    }

    console.log("All plans created successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding plans:", error);
    process.exit(1);
  }
}

seedPlans();
