import { OpenAPIRegistry, OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi";

import { userRegistry } from "@/api/user/userRouter";
import { busCompanyRegistry } from "@/api/busCompanies/busCompanyRouter";

import { authRegistry } from "@/api/auth/authRouter";
import { carRegistry } from "@/api/car/carRouter";
import { seatRegistry } from "@/api/seat/seatRouter";
import { routesRegistry } from "@/api/routes/routesRouter";
import { stationRegistry } from "@/api/station/stationRouter";
import { ticketRegistry } from "@/api/ticket/ticketRouter";
import { chatbotRegistry } from "@/api/chatbot/chatbotRouter";

import { get } from "http";
import { vehicleScheduleRegistry } from "@/api/vehicleSchedule/vehicleSchedule.routes";


export type OpenAPIDocument = ReturnType<OpenApiGeneratorV3["generateDocument"]>;

export function generateOpenAPIDocument(): OpenAPIDocument {
	const registry = new OpenAPIRegistry([

		authRegistry,
		userRegistry,
		carRegistry,
		seatRegistry,
		vehicleScheduleRegistry,
		routesRegistry,

		ticketRegistry,

		stationRegistry,
		busCompanyRegistry,
		stationRegistry,
		chatbotRegistry,
	]);

	const generator = new OpenApiGeneratorV3(registry.definitions);
	const document = generator.generateDocument({
		openapi: "3.0.0",
		info: {
			version: "1.0.0",
			title: "Swagger API",
		},
		externalDocs: {
			description: "View the raw OpenAPI Specification in JSON format",
			url: "/swagger.json",
		},
	});

	document.components = {
		securitySchemes: {
			bearerAuth: {
				type: "http",
				scheme: "bearer",
				bearerFormat: "JWT",
			},
		},
	};

	document.security = [
		{
			bearerAuth: [],
		},
	];

	return document;
}

