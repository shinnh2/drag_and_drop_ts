//사용자의 입력을 받아 개별 프로젝트 신규 등록을 처리하는 클래스
class ProjectInput {
	templateElement: HTMLTemplateElement;
	hostElement: HTMLDivElement;
	element: HTMLFormElement;

	constructor() {
		this.templateElement = <HTMLTemplateElement>(
			document.querySelector("#project-input")!
		);
		this.hostElement = <HTMLDivElement>document.querySelector("#app")!;
		const importedNode = document.importNode(
			this.templateElement.content,
			true
		);
		this.element = <HTMLFormElement>importedNode.firstElementChild!;
		this.element.id = "user-input";
		this.attach();
	}
	private attach() {
		this.hostElement.insertAdjacentElement("afterbegin", this.element);
	}
}

//인스턴스 실행
const prjInput = new ProjectInput();
