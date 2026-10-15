const destinations = ["/captions", "/create", "/club", "/profile"];
export function authDestination(value: unknown) {
  return typeof value === "string" && destinations.includes(value) ? value : "/captions";
}
export const destinationCookie = "hello-return-to";
