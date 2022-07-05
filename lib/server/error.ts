import { NextApiResponse } from "next";

export class HtmlError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export class BadRequest extends HtmlError {
  constructor(message: string) {
    super(400, message);
  }
}

export class Unauthorized extends HtmlError {
  constructor(message: string) {
    super(401, message);
  }
}

export class Forbidden extends HtmlError {
  constructor(message: string) {
    super(403, message);
  }
}

export function handleError(e: any, res: NextApiResponse) {
  if (e instanceof HtmlError) {
    res.status(e.status).json({ error: e.message });
  } else {
    res.status(500).json({ error: e.message });
  }
}
