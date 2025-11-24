<template>
	<Container>
		<div class="prose prose-lg [&_*]:text-blueLogoLight max-w-none px-20">
			<p>En 2012 renaissa&icirc;t une premi&egrave;re fois le Mouvement des Libertariens en France, plus de 10 ans
				apr&egrave;s sa cr&eacute;ation par de c&eacute;l&egrave;bres pionniers tels que Bertrand Lemennicier.
				H&eacute;las, il se perdit avec la cr&eacute;ation du Parti Libertarien.</p>
			<p>En 2025, nous relan&ccedil;ons le <a title="Mouvement des Libertariens" href="libertarien.net">Mouvement des
					Libertariens</a> pour contribuer &agrave; donner un cadre clair et de r&eacute;f&eacute;rence &agrave; la
				doctrine de la Libert&eacute; h&eacute;rit&eacute;e de ses grands auteurs : Murray Rothbard, <a
					title="Hans-Hermann Hoppe" href="bit.ly/hhh-democratie">Hans-Hermann Hoppe</a> et bien d'autres...</p>
			<h2>Motivations</h2>
			<p>La doctrine libertarienne, radicale, anarchiste et capitaliste &agrave; la fois, est la seule pens&eacute;e
				permettant &agrave; tout individu, homme, femme, occidental ou d&rsquo;autre origine, d&rsquo;envisager un
				avenir de Libert&eacute;, de Paix et de Prosp&eacute;rit&eacute; pleines et enti&egrave;res, un r&eacute;el
				avenir de Civilisation, sinon pour l&rsquo;ann&eacute;e qui vient, au moins pour ses enfants.</p>
			<p>Malgr&eacute; des temps qui se troublent, parce que les sombres id&eacute;es ayant sign&eacute; le XXe
				si&egrave;cle ressurgissent, cette doctrine se d&eacute;veloppe un peu partout dans le monde. En 2023,
				l&rsquo;&eacute;lection jusqu&rsquo;alors inimaginable d&rsquo;un Pr&eacute;sident de la R&eacute;publique se
				disant libertarien en Argentine a donn&eacute; un puissant &eacute;lan de visibilit&eacute; &agrave; notre
				&eacute;tiquette. &Ecirc;tre &ldquo;libertarien&rdquo; est soudain devenu un objet de convoitise,
				d&rsquo;&eacute;tonnement, et de haine, aussi.</p>
			<p>En France, pourtant, si diverses initiatives, groupes et personnalit&eacute;s existent, qui s&rsquo;activent
				&agrave; promouvoir nos id&eacute;es, la constellation libertarienne ne dispose pas de son Panache blanc
				f&eacute;d&eacute;rateur, sa flamme n&rsquo;a aucune Lady Liberty &eacute;vidente d&rsquo;o&ugrave;
				&eacute;clairer et guider les esprits neufs qui souhaiteraient nous rejoindre.</p>
			<p>Le Mouvement des Libertariens aspire ainsi &agrave; devenir ce phare reconnu des libertariens francophones.</p>
		</div>
		<div class="flex justify-center">
			<div class="text-center text-yellowLogo sm:text-xl p-2 border-2 border-orangeLogo
				 bg-blueLogoDark font-extrabold italic rounded-lg mt-2 cursor-pointer hover:border-green-500" @click="goToArticleInBlog">
				Lire la suite</div>
		</div>
	</Container>
</template>

<script setup>
import Container from "@/components/Container.vue"
import { useRouter } from "vue-router"

const router = useRouter()

const goToArticleInBlog = () => {
  router.push({ path: "/Blog", query: { expand: 2 } })
}

</script>
