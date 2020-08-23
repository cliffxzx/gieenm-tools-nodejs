import { getRepository } from 'typeorm';
import { getAllAddress, getAllAddressGroup } from '../api/firewall';
import { Host } from '../entity/Host';
import { User } from '../entity/User';
import { AddressGroup } from '../entity/AddressGroup';

export const firewall = {
  async syncFirewallToDataBase() {
    const hosts = await getRepository(Host).find();
    const data = await Promise.all(
      hosts.map((host) => (async () => ({
        host,
        address: await getAllAddress(host.url, host.get().auth),
        addresses: await getAllAddressGroup(host.url, host.get().auth),
      }))),
    );
    const addresses = (await Promise.all(
      hosts.map((host) => getAllAddress(host.url, host.get().auth)),
    )).flat(2);
    const addressGroups = (await Promise.all(
      hosts.map((host) => getAllAddressGroup(host.url, host.get().auth)),
    )).flat(2);
    const userRepository = getRepository(User);

    await Promise.all(addresses.map(async (address) => {
      try {
        const user = new User();
        const name = Array.from(address.name.matchAll(/^(.*?)-?([0-9]+)?$/gi)).flat(2)[1];
        user.name = name;
        await userRepository.save(user);
      } catch (e) {
        console.error(e);
      }
    }));

    await Promise.all(addressGroups.map(async (group) => {
      try {
        const _group = new AddressGroup();
        _group.name = group!.name;
        _group.uidN = group!.id.n;
        _group.uidTime = group!.id.time;
        _group.host;
      } catch (e) {
        console.error(e);
      }
    }));

    console.log(addresses, addressGroups, data);
  },
};
