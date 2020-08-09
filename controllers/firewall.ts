import { ParameterizedContext } from "koa";
import * as api from "../apis/firewall";
import { Middleware } from "@koa/router";

export default {
  async getAllAddress(ctx: ParameterizedContext) {
    const { flr }: { flr: keyof typeof api.floor } = ctx.request.query;

    const IPs = await api.getAllAddress({ auth: ctx.request.header.authorization, flr });
    ctx.body = IPs;
  },
  async addAddress(ctx: ParameterizedContext) {
    const { flr }: { flr: keyof typeof api.floor } = ctx.request.query;

    const res = await api.addAddress({ auth: ctx.request.header.authorization, flr }, ctx.request.body);
    ctx.body = res;
  },
  async delAddress(ctx: ParameterizedContext) {
    const { flr }: { flr: keyof typeof api.floor } = ctx.request.query;

    const res = await api.delAddress({ auth: ctx.request.header.authorization, flr }, ctx.request.body);
    ctx.body = res;
  },
  async getAllAddressGroup(ctx: ParameterizedContext) {
    const { flr }: { flr: keyof typeof api.floor } = ctx.request.query;

    const groups = await api.getAllAddressGroup({ auth: ctx.request.header.authorization, flr });
    ctx.body = groups;
  },
  async getAddressGroup(ctx: ParameterizedContext, next: () => Promise<any>) {
    if (ctx.params.id === 'detail') {
      next();
    } else {
      const { flr }: { flr: keyof typeof api.floor } = ctx.request.query;
      const sid: string = ctx.params.id.split('-');
      const id: api.ID = {
        n: sid[1],
        time: sid[0]
      };

      const group = await api.getAddressGroup({ auth: ctx.request.header.authorization, flr }, { id });
      ctx.body = group;
    }
  },
  async getAllAddressGroupDetail(ctx: ParameterizedContext) {
    const { flr }: { flr: keyof typeof api.floor } = ctx.request.query;

    const groups = await api.getAllAddressGroupDetail({ auth: ctx.request.header.authorization, flr });
    ctx.body = groups;
  },
  async updateAddressGroup(ctx: ParameterizedContext) {
    const { flr }: { flr: keyof typeof api.floor } = ctx.request.query;
    const sid: string = ctx.params.id.split('-');
    const id: api.ID = {
      n: sid[1],
      time: sid[0]
    };
    const { name, addresses }: api.AddressGroup = ctx.request.body;

    const res = api.updateAddressGroup({ auth: ctx.request.header.authorization, flr }, { id, name, addresses })

    ctx.body = res;
  },
  async addAddressesToGroup(ctx: ParameterizedContext) {
    const { flr }: { flr: keyof typeof api.floor } = ctx.request.query;

    const res = await api.addAddressesToGroup({ auth: ctx.request.header.authorization, flr }, ctx.request.body);
    ctx.body = res;
  }
};
