import { getRepository } from 'typeorm';
import {
  getAllAddress, getAllAddressGroup, ID, SmallAddress,
} from '../api/firewall';
import { Host } from '../entity/Host';
import { User } from '../entity/User';
import { AddressGroup } from '../entity/AddressGroup';
import { Address } from '../entity/Address';

export interface addressToGroupMap {
  address: SmallAddress
  host: Host
  addressGroup: AddressGroup | null
}

export const firewall = {
  async syncFirewallToDatabase(): Promise<void> {
    const _hosts = await getRepository(Host).find();

    const hosts = await Promise.all(_hosts.map((host) => (async () => ({
      host,
      address: await getAllAddress(host.url, host.get().auth),
      addressGroup: await getAllAddressGroup(host.url, host.get().auth),
      name: [] as string[],
      group: [] as ID[],
    }))()));

    const userRepository = getRepository(User);
    const addressRepository = getRepository(Address);
    const addressGroupRepository = getRepository(AddressGroup);

    const nameToUser = new Map<string, User>();
    const addressToGroup: addressToGroupMap[] = [];

    // Firewall User to Database
    const dbUsers = await userRepository.find();
    await Promise.all(Array.from(new Set<string>(hosts.map((host) => host.address.map((address) => {
      const name = Array.from(address.name.matchAll(/^(.*?)-?([0-9]+)?$/gi)).flat(2);
      const subname = name[1];
      host.name.push(subname);
      return subname;
    })).flat(2))).map((name) => (async () => {
      const dbNameIndex = dbUsers.findIndex(((val) => val.name === name));
      if (dbNameIndex === -1) {
        const user = new User();
        user.name = name;
        nameToUser.set(name, await userRepository.save(user));
      } else {
        nameToUser.set(name, dbUsers[dbNameIndex]);
      }
    })()));

    // Firewall AddressGroup to Database, Push Address map Group tp addressToGroup
    const dbAddressGroups = await addressGroupRepository.find();
    await Promise.all(hosts.map(
      (host) => Promise.all(host.addressGroup.map((group) => (async () => {
        const dbAddressGroupsIndex = dbAddressGroups.findIndex(
          (val) => val.uidN === group.id.n && val.uidTime === group.id.time,
        );

        let nowGroup: AddressGroup;

        if (dbAddressGroupsIndex === -1) {
          const addressGroup = new AddressGroup();
          addressGroup.host = host.host;
          addressGroup.name = group.name;
          addressGroup.uidN = group.id.n;
          addressGroup.uidTime = group.id.time;
          nowGroup = await addressGroupRepository.save(addressGroup);
          dbAddressGroups.push(nowGroup);
        } else {
          nowGroup = dbAddressGroups[dbAddressGroupsIndex];
        }

        group.inGroup.forEach((address) => addressToGroup.push({
          address,
          host: host.host,
          addressGroup: nowGroup,
        }));
      })())),
    ));

    // Push Address to null group;
    hosts.forEach((host) => host.address.forEach((address) => {
      const ntgIndex = addressToGroup.findIndex(
        (ntg) => ntg.address.name === address.name
          && ntg.address.id.time === address.id.time
          && ntg.host.id === host.host.id,
      );

      if (ntgIndex === -1) {
        addressToGroup.push({
          address,
          host: host.host,
          addressGroup: null,
        });
      }
    }));

    // Firewall Address to Database, Binding User & Group
    const dbAddress = await addressRepository.find({ relations: ['user', 'group'] });
    await Promise.all(addressToGroup.map((idGroup) => (async () => {
      const dbAddressIndex = dbAddress.findIndex(
        (val) => val.uidTime === idGroup.address.id.time
          && val.user.name === idGroup.address.name
          && val?.host?.id === idGroup.host.id
          && val?.group?.id === idGroup.addressGroup?.id,
      );

      let fwAddressIndex = [0, 0];
      hosts.forEach((host, idx) => {
        if (host.host.id === idGroup.host.id) {
          host.address.forEach((address, idx2) => {
            if (address.id.time === idGroup.address.id.time
              && address.name === idGroup.address.name) {
              fwAddressIndex = [idx, idx2];
            }
          });
        }
      });

      const nowAddress = hosts[fwAddressIndex[0]].address[fwAddressIndex[1]];
      if (dbAddressIndex === -1) {
        const _address = new Address();
        _address.uidN = nowAddress.id.n;
        _address.uidTime = nowAddress.id.time;
        _address.ip = nowAddress.ip;
        _address.subnet = nowAddress.subnet;
        _address.mac = nowAddress.mac;
        _address.host = idGroup.host;
        _address.user = nameToUser.get(
          hosts[fwAddressIndex[0]].name[fwAddressIndex[1]],
        ) || new User();

        if (idGroup.addressGroup) {
          _address.group = idGroup.addressGroup;
        }

        dbAddress.push(await addressRepository.save(_address));
      }
    })()));
  },
};
