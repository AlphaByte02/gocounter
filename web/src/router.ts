// Generouted, changes to this file will be overridden
/* eslint-disable */

import { components, hooks, utils } from "@generouted/react-router/client";

export type Path = `/` | `/feed` | `/graph/:id` | `/graph/all`;

export type Params = {
    "/graph/:id": { id: string };
};

export type ModalPath = never;

export const { Link, Navigate } = components<Path, Params>();
export const { useModals, useNavigate, useParams } = hooks<Path, Params, ModalPath>();
export const { redirect } = utils<Path, Params>();
