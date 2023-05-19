interface InfoPane {
  infoText: string;
  width: number;
  height: number;
  textColor: string;
  bulletText: string[];
  infoText2: string;
  infoText2Color: string;
  infoText2BottomAlign: boolean;
}

class InfoPane implements InfoPane {
  constructor(
    public infoText: string = "",
    public width: number = 0,
    public height: number = 0,
    public textColor: string = "0xFFFFFFFF",
    public bulletText: string[] = [],
    public infoText2: string = "",
    public infoText2Color: string = "0xFFFFFFFF",
    public infoText2BottomAlign: boolean = false
  ) {}
}
